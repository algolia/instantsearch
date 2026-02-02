import { createESMConfig, createCJSConfig } from '../../scripts/build/rollup.base.mjs';
import pkg from './package.json' with { type: 'json' };

const input = 'src/index.ts';

export default [
  createESMConfig({
    input,
    pkg,
    outputDir: 'dist/es',
  }),
  createCJSConfig({
    input,
    pkg,
    outputDir: 'dist/cjs',
    // Replace instantsearch.js/es imports with instantsearch.js/cjs for CJS build
    replaceImports: {
      'instantsearch.js/es': 'instantsearch.js/cjs',
    },
  }),
];
