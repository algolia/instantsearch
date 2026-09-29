#!/usr/bin/env node
const fs = require('fs');
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

// The root keeps algoliasearch v5, so `type-check:v3` resolves the v5 typings
// bundled with the package rather than `@types/algoliasearch`. The workspaces
// below are what the downgrade applies to.
const rootPackageJsonPath = packageJsonPaths[0];
const rootDevDependencies = JSON.parse(
  fs.readFileSync(rootPackageJsonPath, 'utf8')
).devDependencies;

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

// Put the root's own dependencies back, undoing the rewrites above for it only.
const rootPackageJson = JSON.parse(
  fs.readFileSync(rootPackageJsonPath, 'utf8')
);
rootPackageJson.devDependencies = rootDevDependencies;
fs.writeFileSync(
  rootPackageJsonPath,
  `${JSON.stringify(rootPackageJson, null, 2)}\n`
);

// `--no-immutable`: the rewrites above intentionally desync package.json from
// the lockfile, and Yarn enables immutable installs by default on CI.
shell.exec('yarn install --no-immutable');
