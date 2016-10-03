module.exports = {
  "extends": "algolia",
  "rules": {
    // monorepo not supported for this rule
    // https://github.com/benmosher/eslint-plugin-import/issues/458
    "import/no-extraneous-dependencies": ["off"]
  }
};
