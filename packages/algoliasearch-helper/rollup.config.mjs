import { readFileSync } from 'fs';

import {
  createUMDConfig,
  createBanner,
} from '../../scripts/build/rollup.base.mjs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = createBanner({
  name: 'Algolia Search Helper',
  version: pkg.version,
});

// UMD build - bundles everything except algoliasearch
export default createUMDConfig({
  input: 'index.js',
  pkg,
  name: 'algoliasearchHelper',
  banner,
  outputDir: 'dist',
  fileName: 'algoliasearch.helper',
  legacyFileNames: true,
  globals: {},
  external: [],
});
