/* eslint-disable import/no-commonjs */

module.exports = {
  extends: ['algolia', 'algolia/react'],
  settings: {
    react: {
      pragma: 'React',
      version: 'preact',
    },
  },
  rules: {
    'jsdoc/check-tag-names': [
      'error',
      {
        jsxTags: true,
      },
    ],
    'react/jsx-filename-extension': 'off',
  },
};
