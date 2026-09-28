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
  ...shell.ls('examples/*/*/{src,lib,pages,app}/*.{js,ts,tsx,vue}')
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

// `@algolia/requester-node-http` ships in both majors, and nothing at the root
// depends on it directly, so Yarn is free to hoist the copy that the
// `algoliasearch-v5` alias pulls in. `tests/mocks/createAlgoliaSearchClient.ts`
// imports it by name and needs `createNodeHttpRequester`, which only exists in
// v4, so pin the root to v4 explicitly.
const rootPackageJsonPath = packageJsonPaths[0];
const rootPackageJson = JSON.parse(
  fs.readFileSync(rootPackageJsonPath, 'utf8')
);
rootPackageJson.devDependencies['@algolia/requester-node-http'] = '4.23.2';
fs.writeFileSync(
  rootPackageJsonPath,
  `${JSON.stringify(rootPackageJson, null, 2)}\n`
);

// Yarn resolves each package's own `@algolia/*` versions, so `algoliasearch@4`
// and the `algoliasearch-v5` alias coexist without hand-built nesting.
shell.exec('yarn install --no-immutable');
