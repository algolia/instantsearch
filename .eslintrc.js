module.exports = {
  extends: ['algolia/react', 'algolia/jest'],
  rules: {
    'no-param-reassign': 'off',
  },
  settings: {
    react: {
      pragma: 'React',
      version: '16.2',
    },
  },
};
