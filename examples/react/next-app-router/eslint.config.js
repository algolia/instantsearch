const nextPlugin = require('eslint-config-next');

module.exports = [
  ...nextPlugin,
  {
    rules: {
      // This rule is not able to find the `pages/` folder in the monorepo.
      '@next/next/no-html-link-for-pages': 'off',
      'react/react-in-jsx-scope': 'off',
      'spaced-comment': ['error', 'always', { markers: ['/', '/'] }],
      // Allow accessing refs during render when using React's use() hook for suspending
      'react-hooks/refs': 'off',
    },
  },
];
