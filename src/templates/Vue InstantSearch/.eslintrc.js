module.exports = {
  // extends from 'prettier/vue' until we update the Algolia configuration
  extends: ['algolia/vue', 'prettier/vue'],
  rules: {
    'import/no-commonjs': 'off',
    // enable the rule until we update the Algolia configuration
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
  },
};
