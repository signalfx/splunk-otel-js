import { start } from '@splunk/otel';
import * as otel from '@opentelemetry/api';

start({
  serviceName: 'random-number-generator',
  // Set up the OpenTelemetry metrics pipeline and start collecting runtime metrics.
  metrics: {
    runtimeMetricsEnabled: true,
  },
});

// Load libraries after calling start()
import * as express from 'express';

const tracer = otel.trace.getTracer('rng-app');
const meter = otel.metrics.getMeter('rng-app');
const requestCounter = meter.createCounter('requests');

const app = express();

app.get('/', (req, res) => {
  requestCounter.add(1);
  const randomValue = tracer.startActiveSpan('calculate-random', (span) => {
    const result = (Math.random() * 42) | 0;
    span.setAttribute('random-result', result);
    span.setAttribute('random-method', 'diceroll');
    span.end();
    return result;
  });

  res.json({ randomValue });
});

app.listen(process.env.PORT || 8080);
