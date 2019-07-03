module.exports = {
  extends: ['algolia', 'algolia/jest', 'algolia/react', 'algolia/typescript'],
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
};
