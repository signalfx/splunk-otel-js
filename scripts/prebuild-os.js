const prebuildify = require('prebuildify');
const os = require('os');

prebuildify({
  strip: false,
  targets: ['8.5.0', '9.0.0', '10.0.0', '11.0.0', '12.0.0', '13.0.0', '14.0.0', '15.0.0', '16.0.0']
}, err => {
  if (err) {
    console.error(err.message || err);
    process.exit(1);
  }
});
