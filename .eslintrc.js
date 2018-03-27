module.exports = {
  extends: ['algolia/react', 'algolia/jest'],
  rules: {
    'no-param-reassign': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      { packageDir: ['./', './packages/*'] },
    ],
  },
};
