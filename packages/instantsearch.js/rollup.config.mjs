/**
 * Rollup configuration for instantsearch.js builds.
 * - ESM: preserved modules, `index.es.ts` is emitted as `es/index.js`
 * - CJS: preserved modules, `index.es.ts` is emitted as `cjs/index.js`
 * - UMD: bundled for browsers from index.ts (which pulls in `umd/`)
 *
 * `index.ts` and `umd/` only exist for the UMD build: the package root
 * (`exports["."]`) resolves to `index.es.ts` in both module formats.
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';

import {
  createESMConfig,
  createCJSConfig,
  createUMDConfig,
  createBanner,
  collectSourceEntries,
} from '../../scripts/build/rollup.base.mjs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = createBanner({
  name: 'InstantSearch.js',
  version: pkg.version,
});

const isESM = process.env.BUILD_FORMAT === 'esm';
const isCJS = process.env.BUILD_FORMAT === 'cjs';
const isUMD = process.env.BUILD_FORMAT === 'umd';

const IGNORED_DIRS = new Set(['__tests__', '__mocks__', 'umd']);

const RESOLVABLE_EXTENSIONS = ['.ts', '.tsx', '.jsx'];

function resolveJsImportsToSource() {
  return {
    name: 'resolve-js-imports-to-source',
    resolveId(source, importer) {
      if (!importer || !source.startsWith('.') || !source.endsWith('.js')) {
        return null;
      }

      const importerDir = dirname(importer);
      const absolutePath = resolve(importerDir, source);

      if (existsSync(absolutePath)) {
        return null;
      }

      const basePath = absolutePath.slice(0, -3);

      return (
        RESOLVABLE_EXTENSIONS.map(
          (extension) => `${basePath}${extension}`
        ).find((candidate) => existsSync(candidate)) || null
      );
    },
  };
}

const configs = [];

// `src/index.es.ts` is the package root. It is built along with the other
// modules and only renamed, so the root and its imports share one copy of the
// code instead of being bundled apart.
const entryFileNames = (chunk) =>
  chunk.name === 'index.es' ? 'index.js' : '[name].js';

if (isESM || (!isESM && !isCJS && !isUMD)) {
  const esmConfig = createESMConfig({
    input: collectSourceEntries({
      exclude: ['index.ts'],
      ignoredDirs: IGNORED_DIRS,
    }),
    pkg,
    outputDir: 'es',
    preserveModules: true,
    plugins: [resolveJsImportsToSource()],
  });

  esmConfig.output = { ...esmConfig.output, entryFileNames };

  configs.push(esmConfig);
}

if (isCJS || (!isESM && !isCJS && !isUMD)) {
  const cjsConfig = createCJSConfig({
    input: collectSourceEntries({
      exclude: ['index.ts'],
      ignoredDirs: IGNORED_DIRS,
    }),
    pkg,
    outputDir: 'cjs',
    preserveModules: true,
  });

  cjsConfig.output = { ...cjsConfig.output, entryFileNames };

  configs.push(cjsConfig);
}

if (isUMD || (!isESM && !isCJS && !isUMD)) {
  configs.push(
    ...createUMDConfig({
      input: 'src/index.ts',
      pkg,
      name: 'instantsearch',
      banner,
      outputDir: 'dist',
      fileName: 'instantsearch',
      globals: {},
      external: [],
    })
  );
}

export default configs;
