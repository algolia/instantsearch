/**
 * Used only by the published build.
 *
 * Templates stay in `hbs` form, so the app that installs this addon
 * compiles them with its own version of Ember.
 */
const stripFormattingWhitespace = require('./template-whitespace.cjs');

module.exports = {
  plugins: [
    [
      '@babel/plugin-transform-typescript',
      {
        allExtensions: true,
        onlyRemoveTypeImports: true,
        allowDeclareFields: true,
      },
    ],
    [
      'babel-plugin-ember-template-compilation',
      {
        targetFormat: 'hbs',
        transforms: [stripFormattingWhitespace],
      },
    ],
    [
      'module:decorator-transforms',
      {
        runtime: {
          import: 'decorator-transforms/runtime-esm',
        },
      },
    ],
  ],

  generatorOpts: {
    compact: false,
  },
};
