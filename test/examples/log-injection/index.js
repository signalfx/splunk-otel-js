const {
  assertSpans,
  logSpanTable,
  request,
  waitSpans,
} = require('../utils.js');
const snapshot = require('./snapshot.js');

// wait for the example to exit
setTimeout(() => {
  console.log('done waiting');
  waitSpans(snapshot.length).then((data) => {
  	logSpanTable(data);
  	assertSpans(data, snapshot);
  }).then(() => {
    console.log(`${snapshot.length} spans validated.`);
  });
}, 1000);
