module.exports = {
  root: true,
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src'],
      },
    },
  },
  rules: {
    // Allow continue statements for cleaner parsing loops
    'no-continue': 'off',
    // Nested ternaries are fine for simple formatting logic
    'no-nested-ternary': 'off',
    // Allow async methods without await for interface consistency
    'require-await': 'off',
    // CLI tool uses console for output
    'no-console': 'off',
    // CLI tool uses process.exit for error handling
    'no-process-exit': 'off',
    // Disable deprecation since we don't have TS project set up for this
    'deprecation/deprecation': 'off',
    // Import order configured differently for this package
    'import/order': 'off',
    // These dependencies are available in the package
    'import/no-unresolved': ['error', { ignore: ['@octokit/rest', '@anthropic-ai/sdk'] }],
  },
};
