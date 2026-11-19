/**
 * Used by Vite for the tests and by editors.
 *
 * The published build uses `babel.publish.config.cjs`.
 */
const { buildMacros } = require('@embroider/macros/babel');

const stripFormattingWhitespace = require('./template-whitespace.cjs');

const macros = buildMacros();

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
        transforms: [stripFormattingWhitespace].concat(macros.templateMacros),
      },
    ],
    [
      'module:decorator-transforms',
      {
        runtime: {
          import: require.resolve('decorator-transforms/runtime-esm'),
        },
      },
    ],
  ].concat(macros.babelMacros),

  generatorOpts: {
    compact: false,
  },
};
