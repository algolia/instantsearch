#!/usr/bin/env node
const path = require('path');

const shell = require('shelljs');

const packageJsonPaths = [
  path.resolve(__dirname, '../../package.json'),
  ...JSON.parse(
    shell.exec(
      "yarn run --silent lerna list --json --all --ignore='example-*'",
      {
        silent: true,
      }
    ).stdout
  ).map(({ location }) => path.resolve(location, 'package.json')),
];

console.log(
  `Downgrading algoliasearch dependency to v4 in:
- ${packageJsonPaths.join('\n- ')}`
);

// change main dependency
shell.sed(
  '-i',
  /"algoliasearch": "5.*"(,?)/,
  '"algoliasearch": "4.23.2"$1',
  packageJsonPaths
);

// Downgrade other dependency
shell.sed(
  '-i',
  /"@algolia\/client-search": "5.*"(,?)/,
  '"@algolia/client-search": "4.23.2"$1',
  packageJsonPaths
);

// remove resolution
shell.sed(
  '-i',
  /"@algolia\/client-common": "5.*"(,?)/,
  '"@algolia/client-common": "4.23.2"$1',
  packageJsonPaths
);
shell.sed(
  '-i',
  /"places.js\/algoliasearch": "5.*"(,?)/,
  '"places.js/algoliasearch": "4.23.2"$1',
  packageJsonPaths
);

// replace import in examples
shell.sed(
  '-i',
  /import { liteClient as algoliasearch } from 'algoliasearch\/lite'/,
  "import algoliasearch from 'algoliasearch/lite'",
  ...shell.ls('examples/*/*/*.{js,ts,tsx,vue}'),
  ...shell.ls('examples/*/*/{src,pages,app}/*.{js,ts,tsx,vue}')
);

// replace common import in examples
shell.sed(
  '-i',
  /import { createMemoryCache } from '@algolia\/client-common';/,
  "import { createInMemoryCache as createMemoryCache } from '@algolia/cache-in-memory';",
  ...shell.ls('examples/*/*/{src,lib,pages,app}/*.{js,ts,tsx,vue}')
);

// replace dependency in examples
shell.sed(
  '-i',
  /"algoliasearch": ".*"(,)?/,
  '"algoliasearch": "4.23.2"$1',
  ...shell.ls('examples/*/*/package.json')
);

shell.exec('yarn install');

// Make sure a specific version of algoliasearch is installed
shell.exec(
  'yarn install --force --cwd scripts/legacy/algoliasearch@4-dependency-container'
);
shell.exec(
  'yarn install --force --cwd scripts/legacy/algoliasearch-v5-dependency-container'
);
shell.rm('-rf', 'node_modules/@algolia');
shell.exec(
  'cp -rf scripts/legacy/algoliasearch@4-dependency-container/node_modules/* node_modules/'
);
shell.exec(
  'cp -rf scripts/legacy/algoliasearch-v5-dependency-container/node_modules/* node_modules/'
);
