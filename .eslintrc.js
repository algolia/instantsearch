module.exports = {
  extends: ['algolia/react', 'algolia/jest'],
  rules: {
    'no-param-reassign': 'off',
    // @TODO: to remove once `eslint-config-algolia` ships the change
    'valid-jsdoc': 'off',
  },
  settings: {
    react: {
      pragma: 'React',
      version: '16.2',
    },
  },
};
