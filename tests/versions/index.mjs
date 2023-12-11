#!/usr/bin/env node
/* eslint-disable no-process-exit, no-console*/
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const dirname = path.dirname(new URL(import.meta.url).pathname);

// This file does not use any dependencies, so that it can be ran before installing

// It checks whether the versions of packages that should be versioned synchronously
// are actually in sync. We need this as long as Lerna doesn't have a mixed mode.
// see: https://github.com/lerna/lerna/issues/1159

let hasError = false;

{
  const PACKAGE_GROUPS = {
    react: [
      'react-instantsearch',
      'react-instantsearch-core',
      'react-instantsearch-router-nextjs',
    ],
  };

  const results = Object.entries(PACKAGE_GROUPS).map(([group, packages]) => {
    const versions = packages.map((name) => [
      name,
      require(`../../packages/${name}/package.json`).version,
    ]);
    const firstVersion = versions[0][1];
    const isValid = versions.every(([, version]) => version === firstVersion);

    return [group, { isValid, versions: Object.fromEntries(versions) }];
  });

  if (results.some(([, { isValid }]) => !isValid)) {
    console.error('Version mismatch detected!');
    console.error(Object.fromEntries(results));
    hasError = true;
  } else {
    console.log('Versions are in sync per flavor');
    console.log(Object.fromEntries(results));
  }
}

{
  const versions = [
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
  ];

  const results = versions.map(({ name, versionFile, format }) => {
    const version = require(`../../packages/${name}/package.json`).version;

    const versionFileContent = fs
      .readFileSync(path.join(dirname, `../../packages/${name}/${versionFile}`))
      .toString();

    const expectedVersionFileContent = (() => {
      switch (format) {
        case 'esm': {
          return `export default '${version}';\n`;
        }
        case 'cjs': {
          return `'use strict';\n\nmodule.exports = '${version}';\n`;
        }
        default: {
          throw new Error(`Unknown format: ${format}`);
        }
      }
    })();

    return {
      name,
      version,
      versionFileContent,
      expectedVersionFileContent,
      isValid: expectedVersionFileContent === versionFileContent,
    };
  });

  if (results.some(({ isValid }) => !isValid)) {
    console.error('Version mismatch detected!');
    console.error(results.filter(({ isValid }) => !isValid));
    hasError = true;
  } else {
    console.log('Version files are in sync.');
    console.log(results);
  }
}

{
  const data = await fetch('https://registry.npmjs.org/search-insights')
    .then((res) => res.json())
    .catch(() => null);

  if (
    !data ||
    !data.versions ||
    !data['dist-tags'] ||
    !data['dist-tags'].latest
  ) {
    console.error('Unable to fetch versions from npm');
    console.error("Can't check if search-insights is up to date");
  } else {
    const { latest } = data['dist-tags'];
    const dependency =
      require('../../packages/instantsearch.js/package.json').dependencies[
        'search-insights'
      ].replace('^', '');
    const [, middleware] = fs
      .readFileSync(
        path.join(
          dirname,
          '../../packages/instantsearch.js/src/middlewares/createInsightsMiddleware.ts'
        ),
        'utf-8'
      )
      .match(/ALGOLIA_INSIGHTS_VERSION = '(.*)';/);

    if (latest !== dependency || latest !== middleware) {
      console.error(`search-insights is not up to date.`);
      hasError = true;
    } else {
      console.log('search-insights is up to date');
    }
    console.log({
      name: 'search-insights',
      latest,
      dependency,
      middleware,
    });
  }
}

if (hasError) {
  process.exit(1);
}
