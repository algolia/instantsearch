#!/usr/bin/env node
const assert = require('assert');
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
  /"algoliasearch": "\^?4.*"(,?)/,
  '"algoliasearch": "3.35.1","@types/algoliasearch": "3.34.10"$1',
  packageJsonPaths
);

// remove other v4 dependencies
shell.sed(
  '-i',
  /"@algolia\/(cache-.*|client-.*|logger-.*|requester-.*|transporter)": "\^?4.*",?/,
  '',
  packageJsonPaths
);

shell.exec('yarn install');

assert.equal(
  require('algoliasearch/package.json').version[0],
  '3',
  'Algoliasearch major version should be 3'
);

assert.equal(
  require('@types/algoliasearch/package.json').version[0],
  '3',
  'Algoliasearch major version should be 3'
);
