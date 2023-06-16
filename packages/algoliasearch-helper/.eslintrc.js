/**
 * @type {import('eslint').Linter.Config}
 */
const config = {
  extends: [
    'algolia',
    'algolia/jest',
    'algolia/react',
    'algolia/typescript',
    'plugin:react-hooks/recommended',
  ],
  overrides: [
    {
      // TODO: should be scoped to helper folder once in monorepo
      files: ['*.js'],
      rules: {
        // Helper uses CommonJS for now
        'import/no-commonjs': 'off',
        'strict': 'off',
        // Helper uses ES5 for now
        'no-var': 'off',
        'vars-on-top': 'off',
        'object-shorthand': 'off',
        'prefer-template': 'off',
        'prefer-spread': 'off',
        'prefer-rest-params': 'off',

        // TODO: migration
        'prettier/prettier': 'off',
      },
    },
    {
      // TODO: should be scoped to helper folder once in monorepo
      files: ['test/**/*.js'],
      rules: {
        'no-console': 'off',
        'jest/no-done-callback': 'off',
        'jest/no-conditional-expect': 'off',
      },
    },
  ]
}

module.exports = config;
