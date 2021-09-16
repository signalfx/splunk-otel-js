const got = require('got');
const {
  assertSpans,
  logSpanTable,
  waitSpans,
} = require('../utils.js');
const snapshot = require('./snapshot.js');

waitSpans(1).then((data) => {
	logSpanTable(data);
	assertSpans(data, snapshot);
});

// will retry if the server has yet not spun up
Promise.all([
  got(process.env.REQ_URL ?? 'http://localhost:8080/hello', {
    retry: {
      errorCodes: 'ECONNREFUSED',
      maxRetryAfter: 1000,
    },
  }),
]);
