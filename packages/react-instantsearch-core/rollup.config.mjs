import {
  createESMConfig,
  createCJSConfig,
  createUMDConfig,
  createBanner,
} from '../../scripts/build/rollup.base.mjs';
import pkg from './package.json' with { type: 'json' };

const input = 'src/index.ts';
const isESM = process.env.BUILD_FORMAT === 'esm';
const isCJS = process.env.BUILD_FORMAT === 'cjs';
const isUMD = process.env.BUILD_FORMAT === 'umd';

const banner = createBanner({
  name: 'React InstantSearch Core',
  version: pkg.version,
});

// When BUILD_FORMAT is set, only build that format
// Otherwise, build all (for watch mode)
const configs = [];

if (isESM || (!isESM && !isCJS && !isUMD)) {
  configs.push(
    createESMConfig({
      input,
      pkg,
      outputDir: 'dist/es',
    })
  );
}

if (isCJS || (!isESM && !isCJS && !isUMD)) {
  configs.push(
    createCJSConfig({
      input,
      pkg,
      outputDir: 'dist/cjs',
      replaceImports: {
        'instantsearch.js/es': 'instantsearch.js/cjs',
      },
    })
  );
}

if (isUMD || (!isESM && !isCJS && !isUMD)) {
  configs.push(
    ...createUMDConfig({
      input,
      pkg,
      name: 'ReactInstantSearchCore',
      banner,
      outputDir: 'dist/umd',
      fileName: 'ReactInstantSearchCore',
      globals: {
        react: 'React',
      },
    })
  );
}

export default configs;
