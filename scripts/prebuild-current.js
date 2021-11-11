const prebuildify = require('prebuildify');

prebuildify({
  targets: [process.versions.node]
}, err => {
  if (err) {
    console.error(err.message || err);
    process.exit(1);
  }
});
