module.exports = {
  extends: ['algolia', 'algolia/jest', 'algolia/react'],
  rules: {
    'no-param-reassign': 0,
    'import/no-extraneous-dependencies': 0,
    'react/no-string-refs': 1,
    // Avoid errors about `UNSAFE` lifecycles (e.g. `UNSAFE_componentWillMount`)
    'react/no-deprecated': 0,
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        // The migration is an incremental process so we import TypeScript modules
        // from JavaScript files.
        // By default, `import/resolver` only supports JavaScript modules.
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
  },
  globals: {
    __DEV__: false,
  },
};
