import { createESMConfig, createCJSConfig, createJsxPragmaFixPlugins } from '../../scripts/build/rollup.base.mjs';
import pkg from './package.json' with { type: 'json' };

const input = 'src/index.ts';

// This package is framework-agnostic and uses /** @jsx createElement */ pragmas
// where `createElement` is a function passed at runtime (not React.createElement).
// SWC has a bug where the pragma name collides with the local `createElement`
// variable (from destructured params), causing it to either drop the binding or
// rename it while JSX calls still reference the bare `createElement`.
// The fix plugins strip the pragma before SWC and restore the correct references after.
const esmJsxFix = createJsxPragmaFixPlugins();
const cjsJsxFix = createJsxPragmaFixPlugins();

export default [
  createESMConfig({
    input,
    pkg,
    outputDir: 'dist/es',
    preSwcPlugins: [esmJsxFix.prePlugin],
    plugins: [esmJsxFix.postPlugin],
  }),
  createCJSConfig({
    input,
    pkg,
    outputDir: 'dist/cjs',
    // Replace instantsearch.js/es imports with instantsearch.js/cjs for CJS build
    replaceImports: {
      'instantsearch.js/es': 'instantsearch.js/cjs',
    },
    preSwcPlugins: [cjsJsxFix.prePlugin],
    plugins: [cjsJsxFix.postPlugin],
  }),
];
