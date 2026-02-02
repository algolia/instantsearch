import { createESMConfig, createCJSConfig } from '../../scripts/build/rollup.base.mjs';

import pkg from './package.json' with { type: 'json' };

const input = 'src/index.ts';
const isESM = process.env.BUILD_FORMAT === 'esm';
const isCJS = process.env.BUILD_FORMAT === 'cjs';

// External dependencies that should NOT be bundled
// These are peer dependencies of this package or its peer dependencies
const external = (id) => {
  // Always external: React and related packages
  if (id === 'react' || id === 'react-dom' || id.startsWith('react/') || id.startsWith('react-dom/')) {
    return true;
  }
  // Always external: Next.js
  if (id === 'next' || id.startsWith('next/')) {
    return true;
  }
  // Always external: instantsearch packages (peer or devDependencies)
  if (id === 'instantsearch.js' || id.startsWith('instantsearch.js/')) {
    return true;
  }
  if (id === 'react-instantsearch' || id.startsWith('react-instantsearch/')) {
    return true;
  }
  if (id === 'react-instantsearch-core' || id.startsWith('react-instantsearch-core/')) {
    return true;
  }
  // Relative imports are not external
  if (id.startsWith('.') || id.startsWith('/')) {
    return false;
  }
  // Check regular dependencies
  const deps = Object.keys(pkg.dependencies || {});
  return deps.some((dep) => id === dep || id.startsWith(`${dep}/`));
};

// When BUILD_FORMAT is set, only build that format
// Otherwise, build both (for watch mode)
const configs = [];

if (isESM || (!isESM && !isCJS)) {
  configs.push(
    createESMConfig({
      input,
      pkg,
      outputDir: 'dist/es',
      external,
    })
  );
}

if (isCJS || (!isESM && !isCJS)) {
  configs.push(
    createCJSConfig({
      input,
      pkg,
      outputDir: 'dist/cjs',
      external,
      // Replace instantsearch.js/es imports with instantsearch.js/cjs for CJS build
      replaceImports: {
        'instantsearch.js/es': 'instantsearch.js/cjs',
      },
    })
  );
}

export default configs;
