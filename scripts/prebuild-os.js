const prebuildify = require('prebuildify');

const args = process.argv.slice(2);
let libc;
const targets = [];

for (const arg of args) {
  if (arg.startsWith('--libc=')) {
    libc = arg.slice('--libc='.length);
  } else {
    targets.push(arg);
  }
}

if (targets.length === 0) {
  targets.push(
    '18.0.0',
    '19.0.0',
    '20.0.0',
    '21.2.0',
    '22.0.0',
    '23.0.0',
    '24.0.0',
    '25.2.0',
    '26.0.0'
  );
}

prebuildify(
  {
    strip: true,
    targets,
    libc,
    tagLibc: libc || undefined,
  },
  (err) => {
    if (err) {
      console.error(err.message || err);
      process.exit(1);
    }
  }
);
