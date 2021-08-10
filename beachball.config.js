module.exports = {
  access: 'public',

  // disable changelogs in /examples/
  bumpDeps: false,

  // intended to be run via CI, so remote = local
  fetch: false,
  push: false,

  // generate the changelog and send a PR, and then it's published
  publish: false,
};
