import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  createUMDConfig,
  createBanner,
} from '../../scripts/build/rollup.base.mjs';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = createBanner({
  name: 'algolia-experiences',
  version: pkg.version,
});

/**
 * Plugin to resolve algoliasearch/lite to the ESM browser build.
 * In this monorepo, algoliasearch is installed via algoliasearch-v5.
 * @returns {Object} Rollup plugin
 */
const resolveAlgoliaLite = () => ({
  name: 'resolve-algoliasearch-lite',
  resolveId(source) {
    if (source === 'algoliasearch/lite') {
      return path.resolve(
        currentDir,
        '../../node_modules/algoliasearch-v5/dist/lite/lite.esm.browser.js'
      );
    }
    return null;
  },
});

// UMD build - bundles everything (including algoliasearch)
export default createUMDConfig({
  input: 'src/index.ts',
  pkg,
  name: 'instantsearch',
  banner,
  outputDir: 'dist',
  fileName: 'algolia-experiences',
  globals: {},
  external: [],
  plugins: [resolveAlgoliaLite()],
});
