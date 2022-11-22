#!/usr/bin/env node
/* eslint-disable no-console, import/no-commonjs */

const path = require('path');
const shell = require('shelljs');

const packageJsonPaths = [
  path.resolve(__dirname, '../../package.json'),
  ...JSON.parse(
    shell.exec(
      'yarn run --silent lerna list --json --all --ignore="example-*"',
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

shell.sed(
  '-i',
  /"algoliasearch": "4.*"(,?)/,
  '"algoliasearch": "3.35.1","@types/algoliasearch": "3.34.10"$1',
  packageJsonPaths
);
shell.sed('-i', /"@algolia\/client-search": "4.*",?/, '', packageJsonPaths);

shell.exec('yarn install');
