/**
 * Rollup configuration for instantsearch.js builds.
 * - ESM: preserved modules + dedicated entry from index.es.ts
 * - CJS: preserved modules
 * - UMD: bundled for browsers
 */
import { existsSync, readFileSync, readdirSync } from 'fs';
import { dirname, extname, join, resolve } from 'path';

import {
  createESMConfig,
  createCJSConfig,
  createUMDConfig,
  createBanner,
} from '../../scripts/build/rollup.base.mjs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = createBanner({
  name: 'InstantSearch.js',
  version: pkg.version,
});

const isESM = process.env.BUILD_FORMAT === 'esm';
const isCJS = process.env.BUILD_FORMAT === 'cjs';
const isUMD = process.env.BUILD_FORMAT === 'umd';

const SOURCE_ROOT = 'src';
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);
const IGNORED_DIRS = new Set(['__tests__', '__mocks__']);
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
      for (const extension of RESOLVABLE_EXTENSIONS) {
        const candidate = `${basePath}${extension}`;
        if (existsSync(candidate)) {
          return candidate;
        }
      }

      return null;
    },
  };
}

function collectSourceEntries({ includeIndex, includeIndexEs }) {
  const entries = [];

  function walk(dir) {
    const dirEntries = readdirSync(dir, { withFileTypes: true });
    for (const entry of dirEntries) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) {
          continue;
        }
        walk(join(dir, entry.name));
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (!SOURCE_EXTENSIONS.has(extname(entry.name))) {
        continue;
      }

      const filePath = join(dir, entry.name);
      const relativePath = filePath.slice(SOURCE_ROOT.length + 1);

      if (!includeIndexEs && relativePath === 'index.es.ts') {
        continue;
      }
      if (!includeIndex && relativePath === 'index.ts') {
        continue;
      }

      entries.push(filePath);
    }
  }

  walk(SOURCE_ROOT);
  return entries;
}

const configs = [];

if (isESM || (!isESM && !isCJS && !isUMD)) {
  const esmEntryConfig = createESMConfig({
    input: 'src/index.es.ts',
    pkg,
    outputDir: 'es',
    plugins: [resolveJsImportsToSource()],
  });

  esmEntryConfig.output = {
    ...esmEntryConfig.output,
    entryFileNames: 'index.js',
  };
  esmEntryConfig.plugins = esmEntryConfig.plugins.filter(
    (plugin) => plugin && plugin.name !== 'emit-package-json'
  );

  configs.push(
    esmEntryConfig,
    createESMConfig({
      input: collectSourceEntries({
        includeIndex: false,
        includeIndexEs: false,
      }),
      pkg,
      outputDir: 'es',
      preserveModules: true,
      plugins: [resolveJsImportsToSource()],
    })
  );
}

if (isCJS || (!isESM && !isCJS && !isUMD)) {
  configs.push(
    createCJSConfig({
      input: collectSourceEntries({
        includeIndex: true,
        includeIndexEs: false,
      }),
      pkg,
      outputDir: 'cjs',
      preserveModules: true,
    })
  );
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
