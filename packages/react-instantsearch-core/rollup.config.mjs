import {
  createESMConfig,
  createCJSConfig,
  createUMDConfig,
  createBanner,
} from '../../scripts/build/rollup.base.mjs';
import { readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import pkg from './package.json' with { type: 'json' };

const SOURCE_ROOT = 'src';
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const IGNORED_DIRS = new Set(['__tests__', '__mocks__']);

function collectSourceEntries(dir = SOURCE_ROOT) {
  const entries = [];
  const dirEntries = readdirSync(dir, { withFileTypes: true });

  for (const entry of dirEntries) {
    const filePath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        entries.push(...collectSourceEntries(filePath));
      }
      continue;
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name))) {
      entries.push(filePath);
    }
  }

  return entries;
}

const moduleInput = collectSourceEntries();
const umdInput = 'src/index.ts';
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
      input: moduleInput,
      pkg,
      outputDir: 'dist/es',
      preserveModules: true,
    })
  );
}

if (isCJS || (!isESM && !isCJS && !isUMD)) {
  configs.push(
    createCJSConfig({
      input: moduleInput,
      pkg,
      outputDir: 'dist/cjs',
      preserveModules: true,
      replaceImports: {
        'instantsearch.js/es': 'instantsearch.js/cjs',
      },
    })
  );
}

if (isUMD || (!isESM && !isCJS && !isUMD)) {
  configs.push(
    ...createUMDConfig({
      input: umdInput,
      pkg,
      name: 'ReactInstantSearchCore',
      banner,
      outputDir: 'dist/umd',
      fileName: 'ReactInstantSearchCore',
      legacyFileNames: true,
      globals: {
        react: 'React',
      },
    })
  );
}

export default configs;
