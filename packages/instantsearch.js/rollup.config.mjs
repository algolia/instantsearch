/**
 * Rollup configuration for instantsearch.js UMD builds.
 * ESM and CJS builds use Babel directly to preserve the file structure.
 */
import { readFileSync } from 'fs';

import {
  createUMDConfig,
  createBanner,
} from '../../scripts/build/rollup.base.mjs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = createBanner({
  name: 'InstantSearch.js',
  version: pkg.version,
});

// UMD build - bundles everything (no external dependencies)
export default createUMDConfig({
  input: 'src/index.ts',
  pkg,
  name: 'instantsearch',
  banner,
  outputDir: 'dist',
  fileName: 'instantsearch',
  globals: {},
  external: [],
});
