const {
  assertSpans,
  logSpanTable,
  request,
  waitSpans,
} = require('../utils.js');
const snapshot = require('./snapshot.js');

waitSpans(snapshot.length).then((data) => {
	logSpanTable(data);
	assertSpans(data, snapshot);
}).then(() => {
  console.log(`${snapshot.length} span(s) validated.`);
});
