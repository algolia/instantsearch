module.exports = {
  extends: ['algolia/react', 'algolia/jest'],
  rules: {
    'no-param-reassign': 'off',
    // @TODO: to remove once `eslint-config-algolia` ships the change
    'valid-jsdoc': 'off',
    // @TODO: re-enable once the rule is properly setup for monorepos
    // https://github.com/benmosher/eslint-plugin-import/issues/1103
    // https://github.com/benmosher/eslint-plugin-import/issues/1174
    'import/no-extraneous-dependencies': 'off',
  },
  settings: {
    react: {
      pragma: 'React',
      version: '16.2',
    },
    'import/resolver': {
      node: {
        // The migration is an incremental process so it happens that we import
        // TypeScript module from JavaScript. By default the `import/resolver`
        // only supports JavaScript modules.
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
  },
};
