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

function hrTimestamp(ts) {
	const unixTimeNanos = BigInt(new Date(ts.slice(0, 19)).getTime()) * 1_000_000n;
	const fractionSeconds = parseFloat(ts.slice(19).replace('Z', ''));
	const fractionNanos = BigInt((fractionSeconds * 1e9) | 0);
  return unixTimeNanos + fractionNanos;
}

const entryToSpan = (entry) => {
  const tags = getAttributes(entry);
  // assuming the first reference is the parent
  const parent = (entry.references ?? []).shift();
  return {
    traceId: entry.traceId,
    id: entry.spanId,
    startTime: entry.startTime,
    hrStartTime: hrTimestamp(entry.startTime),
    name: entry.operationName,
    kind: tags['span.kind'],
    parentSpanId: parent?.spanId,
    parent: parent && {
      id: parent?.spanId,
      traceId: parent?.traceId
    } || undefined,
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

const logMetricTable = (metrics) => {
  console.table(
    metrics.map(({ name, unit, scope, resource }) => ({
      name,
      unit,
      scope,
      'service.name': resource?.['service.name']
    })),
  );
};

const getParentSpan = (arr, span) => {
  assert.strictEqual(typeof span.parentSpanId, 'string', `Invalid parentSpanId: ${util.inspect(span)}`);
  const parent = arr.find((s) => s.id === span.parentSpanId);
  assert(parent, `Parent span with id "${span.parentSpanId}" not found.`);

  return parent;
};

function groupBy(elems, key) {
  const grouped = new Map();

  for (const e of elems) {
    const value = e[key];
    if (grouped.has(value)) {
      grouped.get(value).push(e);
    } else {
      grouped.set(value, [e]);
    }
  }

  return grouped;
}

function sortByName(spans) {
  return spans.sort((a, b) => a.name.localeCompare(b.name));
}

const waitSpans = (count, timeout = 60) => {
  console.error(`Waiting for ${count} spans for ${timeout}s`);
  console.time('waitSpans');
  const collectorUrl = new URL(process.env.COLLECTOR_URL ?? 'http://localhost:8378/spans');
  collectorUrl.searchParams.set('count', count);
  collectorUrl.searchParams.set('timeout', timeout);

  return fetch(collectorUrl)
    .then((res) => res.text())
    .then((content) => {
      if (content.match(/timed.*out.*while.*waiting.*for.*results/)) {
        assert.fail(`Timed out waiting for ${count} spans for ${timeout}s.`);
      }

      return JSON.parse(content);
    })
    .then((res) => {
      console.timeEnd('waitSpans');
      return res.map(entryToSpan);
    });
};

const waitMetrics = (timeout = 60) => {
  console.error(`Waiting for metrics for ${timeout}s`);
  console.time('waitMetrics');

  const collectorUrl = new URL(
    process.env.COLLECTOR_METRICS_URL ?? 'http://localhost:8379/metrics'
  );
  collectorUrl.searchParams.set('timeout', timeout);

  return fetch(collectorUrl)
    .then((res) => res.text())
    .then((content) => {
      if (content.match(/timed.*out.*while.*waiting.*for.*results/i)) {
        assert.fail(`Timed out waiting for metrics for ${timeout}s.`);
      }
      return JSON.parse(content);
    })
    .then((msgs) => {
      console.timeEnd('waitMetrics');
      return msgs
        .flatMap((m) => m.resourceMetrics ?? [])
        .flatMap(entryToMetric);
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

function compareSpans(actual, expected) {
  try {
    assert.notStrictEqual(actual, undefined);
    assert.notStrictEqual(expected, undefined);

    assert.strictEqual(actual.name, expected.name);

    assert.strictEqual(actual.attributes['http.method'], expected.attributes['http.method']);
    assert.strictEqual(actual.attributes['http.url'], expected.attributes['http.url']);
    assert.strictEqual(actual.attributes['http.route'], expected.attributes['http.route']);
    assert.strictEqual(actual.attributes['http.target'], expected.attributes['http.target']);
    assert.strictEqual(actual.attributes['otel.library.name'], expected.attributes['otel.library.name']);

    // TODO: Check for status. HTTP Sink endpoint on the collector doesn't return status correctly.

  } catch (e) {
    e.actualSpan = util.inspect(actual);
    e.expectedSpan = expected;
    e.message = `Span mismatch "${actual.name}": ${e.message}`;
    throw e;
  }
}

// TODO: Timestamp comparisons can be re-enabled
// once https://github.com/open-telemetry/opentelemetry-js/issues/2643 is fixed
function compareTraces(actualRoot, expectedRoot, actualSpansByParentId, expectedSpansByParentId) {
  let queue = [[actualRoot, expectedRoot]];

  while (queue.length > 0) {
    let [actual, expected] = queue.shift();
    compareSpans(actual, expected);

    let actualChildren = sortByName(actualSpansByParentId.get(actual.id) || []);
    let expectedChildren = sortByName(expectedSpansByParentId.get(expected.id) || []);

    assert.strictEqual(
      actualChildren.length,
      expectedChildren.length,
      'Different amount of span children'
    );

    for (let i = 0; i < actualChildren.length; i++) {
      queue.push([actualChildren[i], expectedChildren[i]]);
    }
  }
}

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

  const actualSpansByParentId = groupBy(actualSpans, 'parentSpanId');
  const expectedSpansByParentId = groupBy(expectedSpans, 'parentSpanId');

  const expectedRoots = sortByName(expectedSpansByParentId.get(undefined));
  const actualRoots = sortByName(actualSpansByParentId.get(undefined));

  assert(
    actualRoots.length,
    expectedRoots.length,
    'Expected span count different from actual'
  );

  for (let i = 0; i < actualRoots.length; i++) {
    compareTraces(actualRoots[i], expectedRoots[i], actualSpansByParentId, expectedSpansByParentId);
  }

  return expectedSpans.length;
};

function entryToMetric(entry) {
  const resource = Object.fromEntries(
    (entry.resource?.attributes ?? []).map(({ key, value }) => [
      key,
      value.stringValue ??
      value.intValue   ??
      value.doubleValue??
      value.boolValue  ??
      null, 
    ]),
  );

  return (entry.scopeMetrics ?? []).flatMap((scope) =>
    (scope.metrics ?? []).map((m) => ({
      resource,
      scope : scope.scope?.name,
      name  : m.name,
      unit  : m.unit,
    })),
  );
}

function assertMetrics(actualMetrics, expectedMetrics) {
  if (process.env.LOG_NEW_SNAPSHOTS === 'true') {
    console.error(actualMetrics);
    console.error('skipping checking asserting metrics');
    return 0;
  }
  assert.ok(Array.isArray(actualMetrics), 'Expected actual metrics to be an array');

  const actualMetricsMap = new Map();
  actualMetrics.forEach(metric => {
    actualMetricsMap.set(metric.name, metric);
  });

  Object.entries(expectedMetrics).forEach(([expectedName, expectedProps]) => {
    const actualMetric = actualMetricsMap.get(expectedName);
    
    assert.ok(actualMetric, `metric "${expectedName}" not found`);
    assert.strictEqual(actualMetric.unit, expectedProps.unit, `metric "${expectedName}" unit mismatch`);
    assert.strictEqual(actualMetric.scope, expectedProps.scope, `metric "${expectedName}" scope mismatch`);
    assert.ok(
      matchResource(actualMetric.resource, expectedProps.resource ?? {}),
      `metric "${expectedName}" resource mismatch`
    );
  });

  return true;
}

function matchResource(actual, expected) {
  return Object.entries(expected).every(([k, v]) => actual[k] === v);
}

module.exports = {
  assertSpans,
  logSpanTable,
  logMetricTable,
  request,
  waitSpans,
  waitMetrics,
  assertMetrics
};
