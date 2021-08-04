module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // turned off for Dependabot, which often produces long lines
    // human committers should stick to the limit
    "body-max-line-length": [1, "always", 100],
  },
};
