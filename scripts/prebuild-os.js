const prebuildify = require('prebuildify');

let targets = process.argv.slice(2);

if (targets.length == 0) {
  targets = ['8.5.0', '9.0.0', '10.0.0', '11.0.0', '12.0.0', '13.0.0', '14.0.0', '15.0.0', '16.0.0'];
}

prebuildify({
  strip: false,
  targets: targets,
}, err => {
  if (err) {
    console.error(err.message || err);
    process.exit(1);
  }
});
