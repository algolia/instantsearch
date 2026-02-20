import { createESMConfig, createCJSConfig, createJsxPragmaFixPlugins } from '../../scripts/build/rollup.base.mjs';
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

const input = collectSourceEntries();

// This package is framework-agnostic and uses /** @jsx createElement */ pragmas
// where `createElement` is a function passed at runtime (not React.createElement).
// SWC has a bug where the pragma name collides with the local `createElement`
// variable (from destructured params), causing it to either drop the binding or
// rename it while JSX calls still reference the bare `createElement`.
// The fix plugins strip the pragma before SWC and restore the correct references after.
const jsxFix = createJsxPragmaFixPlugins();

export default [
  createESMConfig({
    input,
    pkg,
    outputDir: 'dist/es',
    preserveModules: true,
    preSwcPlugins: [jsxFix.prePlugin],
    plugins: [jsxFix.postPlugin],
  }),
  createCJSConfig({
    input,
    pkg,
    outputDir: 'dist/cjs',
    preserveModules: true,
    // Replace instantsearch.js/es imports with instantsearch.js/cjs for CJS build
    replaceImports: {
      'instantsearch.js/es': 'instantsearch.js/cjs',
    },
    preSwcPlugins: [jsxFix.prePlugin],
    plugins: [jsxFix.postPlugin],
  }),
];
