module.exports = {
  extends: ['algolia/jest', 'algolia/vue'],
  rules: {
    'no-warning-comments': 'warn', // we have many Todo:, this will remind us to deal with them
    'no-use-before-define': 'off',
  },
  overrides: {
    files: ['src/components/__tests__/*.js'],
    rules: {
      'import/named': 'off', // we import __setState and use it
    },
  },
};
