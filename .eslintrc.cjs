// Editor-only ESLint config for VS Code. Provides live `import/order` diagnostics
// until oxlint's jsPlugins ship LSP support. CLI authority is .oxlintrc.json.
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['import', 'prettier', 'instantsearch-editor'],
  settings: {
    'import/resolver': {
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  rules: {
    'prettier/prettier': 'error',
    'instantsearch-editor/prefer-prettier-ignore-comment': 'error',
    'import/order': [
      'error',
      {
        alphabetize: { caseInsensitive: true, order: 'asc' },
        groups: [
          'builtin',
          'external',
          'parent',
          'sibling',
          'index',
          'type',
        ],
        'newlines-between': 'always',
        pathGroups: [
          { group: 'parent', pattern: '@/**/*', position: 'before' },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
  },
};
