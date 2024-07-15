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
  `Downgrading algoliasearch dependency to v3 in:
- ${packageJsonPaths.join('\n- ')}`
);

// change main dependency
shell.sed(
  '-i',
  /"algoliasearch": "5.*"(,?)/,
  '"algoliasearch": "3.35.1","@types/algoliasearch": "3.34.10"$1',
  packageJsonPaths
);

// remove other v4 dependencies
shell.sed(
  '-i',
  /"@algolia\/(cache-.*|client-.*|logger-.*|requester-.*|transporter|recommend)": "(4|5).*",?/,
  '',
  packageJsonPaths
);

// remove resolution
shell.sed('-i', /"places.js\/algoliasearch": "5.*"(,?)/, '', packageJsonPaths);

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
  '"algoliasearch": "3.35.1","@types/algoliasearch": "3.34.10"$1',
  ...shell.ls('examples/*/*/package.json')
);

// shell.exec('yarn install');
