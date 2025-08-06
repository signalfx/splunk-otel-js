require('@splunk/otel/instrument');
const { trace } = require('@opentelemetry/api');
const express = require('express');

const PORT = process.env.PORT || 8080;
const app = express();
const tracer = trace.getTracer('splunk-otel-example-esbuild');

app.get('/main', (req, res) => {
  const span = tracer.startSpan('main');  
  console.log(201, '/main');
  res.status(201).send('Application started');
  span.end();
});

app.listen(PORT, () => console.log(`Esbuild example app listening on port ${PORT}!`));