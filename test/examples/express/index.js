const {
  assertSpans,
  logSpanTable,
  request,
  waitSpans,
} = require('../utils.js');
const snapshot = require('./snapshot.js');

waitSpans(snapshot.length).then((data) => {
	logSpanTable(data);
  return assertSpans(data, snapshot);
}).then((validatedSpans) => {
  console.log(`${validatedSpans} spans validated.`);
});

request(process.env.REQ_URL ?? 'http://localhost:8080/animal');
