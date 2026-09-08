/*
 * Copyright Splunk Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  Context,
  ContextManager,
  ROOT_CONTEXT,
  trace,
} from '@opentelemetry/api';
import { EventEmitter } from 'events';
import { promiseHooks } from 'node:v8';
import type { ProfilingExtension } from './types';

type ContinuationContextRecord = [
  context: Context,
  traceId?: string,
  spanId?: string,
];
type Listener = (...args: unknown[]) => unknown;
type AddListener = (
  eventName: string | symbol,
  listener: Listener
) => EventEmitter;
type RemoveListener = AddListener;
type RemoveAllListeners = (eventName?: string | symbol) => EventEmitter;
type ListenerPatchMap = Map<string | symbol, WeakMap<Listener, Listener>>;
interface MapCompatibleFrame extends Iterable<[unknown, unknown]> {
  get(key: unknown): unknown;
}

const ADD_LISTENER_METHODS = [
  'addListener',
  'on',
  'once',
  'prependListener',
  'prependOnceListener',
] as const;

/**
 * Node's AsyncContextFrame is Map-compatible and clones all Map entries when
 * an AsyncLocalStorage value changes. Keeping our record as a Map entry makes
 * it travel with the same continuation while remaining isolated by a private
 * symbol. `disable` preserves compatibility when application ALS instances
 * are disabled while this frame is current.
 */
class ContinuationContextFrame extends Map<unknown, unknown> {
  disable(store: unknown): void {
    this.delete(store);
  }
}

function isMapCompatibleFrame(value: unknown): value is MapCompatibleFrame {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<MapCompatibleFrame>;
  return (
    typeof candidate.get === 'function' &&
    typeof candidate[Symbol.iterator] === 'function'
  );
}

export class ContinuationPreservedContextManager implements ContextManager {
  private readonly _contextKey = Symbol('SplunkProfilingContext');
  private readonly _extension: ProfilingExtension;
  private readonly _listenerPatches = new WeakMap<
    EventEmitter,
    ListenerPatchMap
  >();
  private _enabled = false;
  private _wrapped = false;
  private _stopPromiseHooks?: () => void;

  constructor(extension: ProfilingExtension) {
    this._extension = extension;
  }

  active(): Context {
    const frame = this._extension.getContinuationContext();

    if (!isMapCompatibleFrame(frame)) {
      return ROOT_CONTEXT;
    }

    const record = frame.get(this._contextKey);
    return Array.isArray(record) && record[0] !== undefined
      ? record[0]
      : ROOT_CONTEXT;
  }

  with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    context: Context,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F> {
    const previousFrame = this._extension.getContinuationContext();
    const frame = new ContinuationContextFrame(
      isMapCompatibleFrame(previousFrame) ? previousFrame : undefined
    );
    const spanContext = trace.getSpanContext(context);
    const record: ContinuationContextRecord = [
      context,
      spanContext?.traceId,
      spanContext?.spanId,
    ];

    frame.set(this._contextKey, record);
    this._extension.setContinuationContext(frame);
    this._extension.enterContinuationContext();

    try {
      return fn.call(thisArg, ...args);
    } finally {
      this._extension.setContinuationContext(previousFrame);
      // Switching after restoration closes the inner activation and re-enters
      // an outer profiling context, if there is one.
      this._extension.enterContinuationContext();
    }
  }

  bind<T>(context: Context, target: T): T {
    if (target instanceof EventEmitter) {
      return this._bindEventEmitter(context, target) as T;
    }

    if (typeof target === 'function') {
      return this._bindFunction(context, target);
    }

    return target;
  }

  enable(): this {
    if (this._enabled) {
      return this;
    }

    if (!this._extension.enableContinuationContext(this._contextKey)) {
      return this;
    }

    this._stopPromiseHooks = promiseHooks.createHook({
      before: () => this._extension.enterContinuationContext(),
      after: () => this._extension.exitContinuationContext(),
    }) as () => void;
    this._enabled = true;
    return this;
  }

  disable(): this {
    this._stopPromiseHooks?.();
    this._stopPromiseHooks = undefined;

    if (this._enabled) {
      this._extension.disableContinuationContext();
      this._enabled = false;
    }

    return this;
  }

  private _bindFunction<T>(context: Context, target: T): T {
    const manager = this;
    const targetFunction = target as (...args: unknown[]) => unknown;
    const contextWrapper = function (this: unknown, ...args: unknown[]) {
      return manager.with(context, targetFunction, this, ...args);
    };

    Object.defineProperty(contextWrapper, 'length', {
      enumerable: false,
      configurable: true,
      writable: false,
      value: targetFunction.length,
    });

    return contextWrapper as T;
  }

  private _bindEventEmitter(
    context: Context,
    emitter: EventEmitter
  ): EventEmitter {
    if (this._listenerPatches.has(emitter)) {
      return emitter;
    }

    this._listenerPatches.set(emitter, new Map());

    for (const methodName of ADD_LISTENER_METHODS) {
      const original = emitter[methodName] as AddListener;
      Object.defineProperty(emitter, methodName, {
        configurable: true,
        writable: true,
        value: this._patchAddListener(emitter, original, context),
      });
    }

    Object.defineProperty(emitter, 'removeListener', {
      configurable: true,
      writable: true,
      value: this._patchRemoveListener(
        emitter,
        emitter.removeListener as RemoveListener
      ),
    });
    Object.defineProperty(emitter, 'off', {
      configurable: true,
      writable: true,
      value: this._patchRemoveListener(emitter, emitter.off as RemoveListener),
    });
    Object.defineProperty(emitter, 'removeAllListeners', {
      configurable: true,
      writable: true,
      value: this._patchRemoveAllListeners(
        emitter,
        emitter.removeAllListeners as RemoveAllListeners
      ),
    });

    return emitter;
  }

  private _patchAddListener(
    emitter: EventEmitter,
    original: AddListener,
    context: Context
  ): AddListener {
    const manager = this;

    return function (this: EventEmitter, eventName, listener) {
      // EventEmitter.once() internally calls .on(). Avoid wrapping its wrapper
      // a second time because that breaks removeListener() bookkeeping.
      if (manager._wrapped) {
        return original.call(this, eventName, listener);
      }

      const patchMap = manager._listenerPatches.get(emitter);
      let listeners = patchMap?.get(eventName);

      if (listeners === undefined) {
        listeners = new WeakMap();
        patchMap?.set(eventName, listeners);
      }

      const patchedListener = manager.bind(context, listener);
      listeners.set(listener, patchedListener);
      manager._wrapped = true;

      try {
        return original.call(this, eventName, patchedListener);
      } finally {
        manager._wrapped = false;
      }
    };
  }

  private _patchRemoveListener(
    emitter: EventEmitter,
    original: RemoveListener
  ): RemoveListener {
    const manager = this;

    return function (this: EventEmitter, eventName, listener) {
      const patchedListener = manager._listenerPatches
        .get(emitter)
        ?.get(eventName)
        ?.get(listener);
      return original.call(this, eventName, patchedListener ?? listener);
    };
  }

  private _patchRemoveAllListeners(
    emitter: EventEmitter,
    original: RemoveAllListeners
  ): RemoveAllListeners {
    const manager = this;

    return function (this: EventEmitter, eventName?) {
      const patchMap = manager._listenerPatches.get(emitter);

      if (eventName === undefined) {
        patchMap?.clear();
      } else {
        patchMap?.delete(eventName);
      }

      return arguments.length === 0
        ? original.call(this)
        : original.call(this, eventName);
    };
  }
}
