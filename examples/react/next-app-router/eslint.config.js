const nextPlugin = require('eslint-config-next');

module.exports = [
  ...nextPlugin,
  {
    rules: {
      // This rule is not able to find the `pages/` folder in the monorepo.
      '@next/next/no-html-link-for-pages': 'off',
      'react/react-in-jsx-scope': 'off',
      'spaced-comment': ['error', 'always', { markers: ['/'] }],
    },
  },
];

