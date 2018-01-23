module.exports = {
  extends: ['algolia/jest', 'algolia/vue'],
  rules: {
    'no-warning-comments': 'warn', // we have many Todo:, this will remind us to deal with them
    'no-use-before-define': 'off',
  },
};
