const assert = require('assert');
const util = require('util');

/*
entry:
{
  traceId: 'zcZ02rhS4pJN3/pwY8kbLA==',
  spanId: 'nG9r+jydM48=',
  operationName: 'GET /all',
  startTime: '2021-09-15T18:29:10.167953664Z',
  duration: '0.013452544s',
  tags: [
    {
      key: 'otel.library.name',
      vStr: '@opentelemetry/instrumentation-http'
    },
    { key: 'otel.library.version', vStr: '0.23.0' },
    { key: 'http.url', vStr: 'http://app/all' },
    { key: 'http.host', vStr: 'app' },
    { key: 'net.host.name', vStr: 'app' },
    { key: 'http.method', vStr: 'GET' },
    { key: 'http.route', vStr: '/all' },
    { key: 'http.target', vStr: '/all' },
    { key: 'http.flavor', vStr: '1.1' },
    { key: 'net.transport', vStr: 'ip_tcp' },
    { key: 'net.host.ip', vStr: '::ffff:172.18.0.3' },
    { key: 'net.host.port', vType: 'INT64', vInt64: '80' },
    { key: 'net.peer.ip', vStr: '::ffff:172.18.0.4' },
    { key: 'net.peer.port', vType: 'INT64', vInt64: '46886' },
    { key: 'http.status_code', vType: 'INT64', vInt64: '200' },
    { key: 'http.status_text', vStr: 'OK' },
    { key: 'span.kind', vStr: 'server' },
    { key: 'status.code', vType: 'INT64', vInt64: '1' }
  ]
}
*/
const entryToSpan = (entry) => {
  const tags = getAttributes(entry);
  // assuming the first reference is the parent
  const parent = (entry.references ?? []).shift();
  return {
    traceId: entry.traceId,
    id: entry.spanId,
    startTime: new Date(entry.startTime),
    name: entry.operationName,
    kind: tags['span.kind'],
    parentSpanId: parent?.spanId,
    parent: parent && {
      id: parent?.spanId,
      traceId: parent?.traceId
    } || undefined,
    references: entry.references,
    status: { code: tags['status.code'] },
    attributes: tags,
  };
};

const getAttributes = (e) => {
  return Object.fromEntries(e.tags.map((t) => [t.key, t.vStr]));
};

const logSpanTable = (spans) => {
  console.table(
    spans.map((e, idx) => {
      return {
        start: e.startTime,
        id: e.id,
        name: e.name,
        kind: e.kind,
        parentSpanId: e.parentSpanId,
      };
    })
  );
};

const getParentSpan = (arr, span) => {
  assert.strictEqual(typeof span.parentSpanId, 'string', `Invalid parentSpanId: ${util.inspect(span)}`);
  const parent = arr.find((s) => s.id === span.parentSpanId);
  assert(parent, `Parent span with id "${span.parentSpanId}" not found.`);

  return parent;
};

const waitSpans = (count, timeout = 60) => {
  console.error(`Waiting for ${count} spans for ${timeout}s`);
  console.time('waitSpans');
  const collectorUrl = new URL(process.env.COLLECTOR_URL ?? 'http://localhost:8378');
  collectorUrl.searchParams.set('count', count);
  collectorUrl.searchParams.set('timeout', timeout);

  return fetch(collectorUrl)
    .then((res) => res.text())
    .then((content) => {
      if (content.match(/timed.*out.*waiting.*spans/)) {
        assert.fail(`Timed out waiting for ${count} spans for ${timeout}s.`);
      }

      return JSON.parse(content);
    })
    .then((res) => {
      console.timeEnd('waitSpans');
			console.log(res);
      return res.map(entryToSpan).sort((a, b) => a.startTime - b.startTime);
    });
};

const request = async (url) => {
  for (let i = 0; i < 30; i++) {
    try {
      return await fetch(url);
    } catch (e) {
      if (e?.cause?.code === 'ECONNREFUSED') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      return Promise.reject(e);
    }
  }
};

const assertSpans = (actualSpans, expectedSpans) => {
  if (process.env.LOG_NEW_SNAPSHOTS === 'true') {
    console.error(actualSpans);
    console.error('skipping checking asserting spans');
    return 0;
  }
  assert(Array.isArray(actualSpans), 'Expected `actualSpans` to be an array');
  assert(
    Array.isArray(expectedSpans),
    'Expected `expectedSpans` to be an array'
  );
  assert.strictEqual(
    actualSpans.length,
    expectedSpans.length,
    'Expected span count different from actual'
  );

  actualSpans.forEach((span, idx) => {
    const expected = expectedSpans[idx];
    if (expected === null) return;
    try {
      assert.notStrictEqual(span, undefined);
      assert.notStrictEqual(expected, undefined);

      assert.strictEqual(span.name, expected.name);

      assert.strictEqual(span.attributes['http.method'], expected.attributes['http.method']);
      assert.strictEqual(span.attributes['http.url'], expected.attributes['http.url']);
      assert.strictEqual(span.attributes['http.route'], expected.attributes['http.route']);
      assert.strictEqual(span.attributes['http.target'], expected.attributes['http.target']);
      assert.strictEqual(span.attributes['otel.library.name'], expected.attributes['otel.library.name']);

      // TODO: Check for status. HTTP Sink endpoint on the collector doesn't return status correctly.
      if (expected.parentSpanId == undefined) {
        assert.strictEqual(expected.parentSpanId, span.parentSpanId, 'Expected no parent span, but got one');
      } else {
        assert.strictEqual(
          getParentSpan(actualSpans, span).name,
          getParentSpan(expectedSpans, expected).name
        );
      }
    } catch (e) {
      e.actualSpan = util.inspect(span);
      e.expectedSpan = expected;
      e.message = `At span[${idx}] "${span.name}": ${e.message}`;
      throw e;
    }
  });

  return expectedSpans.length;
};

module.exports = {
  assertSpans,
  logSpanTable,
  request,
  waitSpans,
};
