/* eslint-disable import/no-commonjs */

const PACKAGE_GROUPS = {
  react: [
    'react-instantsearch',
    'react-instantsearch-core',
    'react-instantsearch-router-nextjs',
  ],
};

const VERSION_FILES = [
  {
    name: 'react-instantsearch-core',
    versionFile: 'src/version.ts',
    format: 'esm',
  },
  {
    name: 'instantsearch.js',
    versionFile: 'src/lib/version.ts',
    format: 'esm',
  },
  {
    name: 'algoliasearch-helper',
    versionFile: 'src/version.js',
    format: 'cjs',
  },
  {
    name: 'instantsearch-ui-components',
    versionFile: 'src/version.ts',
    format: 'esm',
  },
];

function buildVersionFileContent(version, format) {
  switch (format) {
    case 'esm':
      return `export default '${version}';\n`;
    case 'cjs':
      return `'use strict';\n\nmodule.exports = '${version}';\n`;
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}

module.exports = { PACKAGE_GROUPS, VERSION_FILES, buildVersionFileContent };
