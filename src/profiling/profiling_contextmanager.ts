import * as opentelemetry from '@opentelemetry/api';
import type { Context } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { loadExtension } from '.';
import type { ProfilingExtension } from './types';

type ContextRecorder = Pick<ProfilingExtension, 'enterContext' | 'exitContext'>;

export class ProfilingContextManager extends AsyncHooksContextManager {
    protected _idMap: WeakMap<Context, number> = new WeakMap();
    protected _idSeq: number = 0;
    protected _enterContextOriginal: (context: Context) => void;
    protected _recorder: ContextRecorder;

    constructor() {
      super();

      let recorder: ContextRecorder | undefined = loadExtension();
      
      if (recorder == undefined) {
        recorder = {
          enterContext: () => {},
          exitContext: () => {}
        }
      }

      this._recorder = recorder;

      this._enterContextOriginal = this['_enterContext'];

      this['_enterContext'] = this._enterContextOverride;
      this['_exitContext'] = this._exitContextOverride;
    }

    _enterContextOverride(context: Context) {
      this._enterContextOriginal(context);

      const spanCtx = opentelemetry.trace.getSpanContext(context);

      if (!spanCtx) return;

      if (!this._idMap.has(context)) {
        this._idMap.set(context, this._idSeq++);
      }

      const index = this._idMap.get(context)!;

      const { traceId, spanId } = spanCtx;
      this._recorder.enterContext(index, traceId, spanId);
    }

    _exitContextOverride() {
        let context = this['_stack'].pop();
        if (context) {
          let index = this._idMap.get(context);

          if (index !== undefined) {
            this._recorder.exitContext(index);
          }
        }
        return context;
    }
}
