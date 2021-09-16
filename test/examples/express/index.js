const got = require('got');
const {
  assertSpans,
  logSpanTable,
  waitSpans,
} = require('../utils.js');
const snapshot = require('./snapshot.js');

waitSpans(snapshot.length).then((data) => {
	logSpanTable(data);
	assertSpans(data, snapshot);
});

got(process.env.REQ_URL ?? 'http://localhost:8080/all', {
  retry: {
    errorCodes: 'ECONNREFUSED',
    maxRetryAfter: 1000,
  },
});
