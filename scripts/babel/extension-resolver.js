/* eslint-disable import/no-commonjs */
// original source: https://github.com/saiichihashimoto/babel-plugin-extension-resolver
// To create proper ES Modules, the paths imported need to be fully-specified,
// and can't be resolved like is possible with CommonJS. To have large compatibility
// without much hassle, we don't use extensions *inside* the source code, but add
// them with this plugin.

const path = require('path');
const resolve = require('resolve');

const DEFAULT_EXTENSIONS = [
  '.node.mjs',
  '.mjs',
  '.node.js',
  '.js',
  '.node.ts',
  '.ts',
  '.node.tsx',
  '.tsx',
  '.json',
  '.node.jsx',
  '.jsx',
  '.node',
];

function extensionResolver(
  { types },
  { extensions = DEFAULT_EXTENSIONS, resolveOptions = {} }
) {
  return {
    name: 'babel-plugin-extension-resolver',
    visitor: {
      Program: {
        enter(programPath, state) {
          const {
            file: {
              opts: { filename },
            },
          } = state;

          function replaceSource(source) {
            if (!types.isStringLiteral(source)) {
              return;
            }

            const sourcePath = source.node.value;
            if (sourcePath[0] !== '.') {
              return;
            }

            const basedir = path.dirname(filename);

            const resolvedPath = path.relative(
              basedir,
              resolve.sync(sourcePath, {
                ...resolveOptions,
                basedir,
                extensions,
              })
            );

            source.replaceWith(
              types.stringLiteral(
                resolvedPath[0] === '.' ? resolvedPath : `./${resolvedPath}`
              )
            );
          }

          programPath.traverse(
            {
              ImportDeclaration(declaration) {
                replaceSource(declaration.get('source'));
              },
              ExportDeclaration(declaration) {
                replaceSource(declaration.get('source'));
              },
            },
            state
          );
        },
      },
    },
  };
}

module.exports = extensionResolver;
