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
shell.sed('-i', /"@algolia\/client-common": "5.*"(,?)/, '', packageJsonPaths);
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

// replace dependency in examples
shell.sed(
  '-i',
  /"algoliasearch": ".*"(,)?/,
  '"algoliasearch": "4.23.2"$1',
  ...shell.ls('examples/*/*/package.json')
);

shell.exec('yarn install');

// fix mistake in the dependency resolution
shell.exec('cp -r node_modules/algoliasearch-v4 node_modules/algoliasearch');
shell.exec('rm -rf node_modules/algoliasearch/node_modules');
