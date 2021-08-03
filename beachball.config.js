module.exports = {
  access: 'public',

  // disable changelogs in /examples/
  bumpDeps: false,

  // intended to be run via CI, so remote = local
  fetch: false,
  push: false,
};
