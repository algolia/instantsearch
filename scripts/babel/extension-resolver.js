/* eslint-disable import/no-commonjs */
// original source: https://github.com/shimataro/babel-plugin-module-extension-resolver
// To create proper ES Modules, the paths imported need to be fully-specified,
// and can't be resolved like is possible with CommonJS. To have large compatibility
// without much hassle, we don't use extensions *inside* the source code, but add
// them with this plugin.

const fs = require('fs');
const path = require('path');

const PLUGIN_NAME = 'babel-plugin-extension-resolver';

const srcExtensions = ['.js', '.ts', '.tsx'];
const dstExtension = '.js';

module.exports = function extensionResolver(babel) {
  const { types } = babel;
  return {
    name: PLUGIN_NAME,
    visitor: {
      Program: {
        enter: (programPath, state) => {
          const { filename } = state;
          programPath.traverse(
            {
              ImportDeclaration(declaration) {
                handleImportDeclaration(types, declaration, filename);
              },
              ExportDeclaration(declaration) {
                handleExportDeclaration(types, declaration, filename);
              },
            },
            state
          );
        },
      },
    },
  };
};

function handleImportDeclaration(types, declaration, fileName) {
  const source = declaration.get('source');
  replaceSource(types, source, fileName);
}

function handleExportDeclaration(types, declaration, fileName) {
  const source = declaration.get('source');
  if (Array.isArray(source)) {
    return;
  }
  replaceSource(types, source, fileName);
}

function replaceSource(types, source, fileName) {
  if (!source.isStringLiteral()) {
    return;
  }
  const sourcePath = source.node.value;
  if (sourcePath[0] !== '.') {
    return;
  }
  const baseDir = path.dirname(fileName);
  const resolvedPath = resolvePath(baseDir, sourcePath);
  const normalizedPath = normalizePath(resolvedPath);
  source.replaceWith(types.stringLiteral(normalizedPath));
}

function resolvePath(baseDir, sourcePath) {
  for (const title of [sourcePath, path.join(sourcePath, 'index')]) {
    const resolvedPath = resolveExtension(baseDir, title);
    if (resolvedPath !== null) {
      return resolvedPath;
    }
  }
  throw new Error(`local import for "${sourcePath}" could not be resolved`);
}

function resolveExtension(baseDir, sourcePath) {
  const absolutePath = path.join(baseDir, sourcePath);
  if (isFile(absolutePath)) {
    return sourcePath;
  }
  for (const extension of srcExtensions) {
    if (isFile(`${absolutePath}${extension}`)) {
      return path.relative(baseDir, `${absolutePath}${dstExtension}`);
    }
  }
  return null;
}

function normalizePath(originalPath) {
  let normalizedPath = originalPath;
  if (path.sep === '\\') {
    normalizedPath = normalizedPath.split(path.sep).join('/');
  }
  if (normalizedPath[0] !== '.') {
    normalizedPath = `./${normalizedPath}`;
  }
  return normalizedPath;
}

function isFile(pathName) {
  try {
    return fs.statSync(pathName).isFile();
  } catch (err) {
    return false;
  }
}
