import {
  createESMConfig,
  createCJSConfig,
} from '../../scripts/build/rollup.base.mjs';

import pkg from './package.json' with { type: 'json' };

const input = 'src/index.ts';
const isESM = process.env.BUILD_FORMAT === 'esm';
const isCJS = process.env.BUILD_FORMAT === 'cjs';

// When BUILD_FORMAT is set, only build that format
// Otherwise, build both (for watch mode)
const configs = [];

if (isESM || (!isESM && !isCJS)) {
  configs.push(
    createESMConfig({
      input,
      pkg,
      outputDir: 'dist/es',
    })
  );
}

if (isCJS || (!isESM && !isCJS)) {
  configs.push(
    createCJSConfig({
      input,
      pkg,
      outputDir: 'dist/cjs',
      // Replace instantsearch.js/es imports with instantsearch.js/cjs for CJS build
      replaceImports: {
        'instantsearch.js/es': 'instantsearch.js/cjs',
      },
    })
  );
}

export default configs;
