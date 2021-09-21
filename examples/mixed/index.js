const http = require('http');
const { trace, SpanStatusCode } = require('@opentelemetry/api');

const PORT = process.env.PORT || 8080;
const tracer = trace.getTracer('splunk-otel-example-mixed');
// do really hard, but important work
const work = async (duration = 500) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(42), duration);
  });
};

const server = http.createServer(async (req, res) => {
  /*
    Perhaps the easiest way to add instrumentation to your code is to
    manually start and stop spans in your code.
    Those spans will automatically be created "in context", which in
    this case means they will be a child of the HTTP response span.
  */
  const expectedDuration = 300;
  // Spans can get attributes at the creation
  const span = tracer.startSpan('work', {
    attributes: {
      'work.expected_duration': expectedDuration,
      'work.my_parameter': 42,
    },
  });
  // Do the work anc collect the result
  const result = await work(expectedDuration)
    .catch((err) => {
      // If the work fails, you can reflect that in the span's status
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message,
      });
    });

  // Attributes can also be added after span creation
  span.setAttribute('work.result', result);

  // Spans have to be manually ended. Only then will they be exported.
  span.end();

  res.end('All done!\n');
});

server.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
