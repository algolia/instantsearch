module.exports = {
  extends: ['algolia/react', 'algolia/jest'],
  rules: {
    'no-param-reassign': 'off',
    // Should be removed when the new verison of
    // eslint-config-algolia is released (> 13.1.0)
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],
  },
  settings: {
    react: {
      pragma: 'React',
      version: '16.2',
    },
  },
};
