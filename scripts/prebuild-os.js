const prebuildify = require('prebuildify');

let targets = process.argv.slice(2);

if (targets.length == 0) {
  targets = [
    '14.0.0',
    '15.0.0',
    '16.0.0',
    '17.0.1',
    '18.0.0',
    '19.0.0',
    '20.0.0',
    '21.2.0'
  ];
}

prebuildify({
  strip: true,
  targets: targets,
}, err => {
  if (err) {
    console.error(err.message || err);
    process.exit(1);
  }
});
