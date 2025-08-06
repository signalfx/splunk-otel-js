const {
  request,
  waitSpans,
  waitMetrics,
  logSpanTable,
  logMetricTable,
  assertSpans,
  assertMetrics
} = require('../utils.js');
const snapshot = require('./snapshot.js');

const metricsSnapshot = require('./metric-snapshot.js');

const REQ_URL = process.env.REQ_URL ?? 'http://localhost:8080/main';

const SPAN_TIMEOUT = Number(process.env.SPAN_TIMEOUT ?? 30);
const METRICS_TIMEOUT = Number(process.env.METRICS_TIMEOUT ?? 30);

(async () => {
  console.log('ESBuild end-to-end test start');

  await request(REQ_URL);

  const spans = await waitSpans(snapshot.length, SPAN_TIMEOUT);
  logSpanTable(spans);
  assertSpans(spans, snapshot);
  console.log(`${spans.length} spans validated`);

  const metrics = await waitMetrics(METRICS_TIMEOUT);
  logMetricTable(metrics);
  assertMetrics(metrics, metricsSnapshot);
  console.log("metrics validated");
  
})();