// eslint-disable-next-line import/no-commonjs
module.exports = {
  extends: ['algolia', 'algolia/jest', 'algolia/react', 'algolia/typescript'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    'jest/expect-expect': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
    jest: {
      version: 'detect',
    },
  },
};
