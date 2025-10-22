import { MeterProvider, propagation, TextMapPropagator, TracerProvider } from "@opentelemetry/api";
import { LoggerProvider } from "@opentelemetry/api-logs";
import { Resource } from "@opentelemetry/resources";

export class SDK {
  public tracerProvider?: TracerProvider;
  public meterProvider?: MeterProvider;
  public loggerProvider?: LoggerProvider;
  public propagator?: TextMapPropagator;
  public resource?: Resource;

  protected disableCallbacks: (() => void)[] = [];

  public registerGlobals() {
    if (this.propagator) {
      propagation.setGlobalPropagator(this.propagator);
      this.disableCallbacks.push(() => propagation.disable());
    }
  }

  public disable() {
    this.disableCallbacks.forEach(cb => cb());
    this.disableCallbacks.splice(0, Infinity);
  }
}
