/* eslint-disable no-console */
import assert from 'node:assert';
import { createRequire } from 'node:module';
import vm from 'node:vm';

import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { rollup } from 'rollup';

// `<InstantSearch>` reads the Chat message revision helpers on every render, so
// whatever those helpers touch sits on the hot path of every consumer, Chat or
// not. The build transpiles to `ie >= 11` and deliberately injects no
// polyfills (`scripts/build/rollup.plugins.mjs`), so `globalThis` must be
// probed with `typeof`: directly reading a missing global binding throws.
//
// This drives the built package through a modern realm with the `globalThis`
// binding removed, which is narrower than an IE11 emulation. Jest cannot cover
// it: the root `moduleNameMapper` rewrites `instantsearch.js/es/*` back to
// TypeScript sources, so a unit test never sees the downlevelled output.

const require = createRequire(import.meta.url);

const CONSUMER = `
import React from 'react';
import { renderToString } from 'react-dom/server';
import { InstantSearch } from 'react-instantsearch-core';

const searchClient = {
  search() { return Promise.resolve({ results: [] }); },
  addAlgoliaAgent() {},
  transporter: { headers: {}, queryParameters: {} },
};

module.exports.render = function render() {
  return renderToString(
    React.createElement(InstantSearch, { searchClient, indexName: 'idx' }, null)
  );
};
`;

const consumerPlugin = {
  name: 'consumer',
  resolveId: (source) => (source === 'consumer' ? source : null),
  load: (id) => (id === 'consumer' ? CONSUMER : null),
};

// React stays external so it is required from the host realm: only
// InstantSearch code is evaluated inside the realm under test.
const bundle = await rollup({
  input: 'consumer',
  external: ['react', 'react-dom/server'],
  plugins: [consumerPlugin, nodeResolve(), commonjs()],
});

let code;
try {
  const { output } = await bundle.generate({ format: 'cjs', exports: 'auto' });
  code = output[0].code;
} finally {
  await bundle.close();
}

/**
 * Evaluates the bundle in a realm with no `globalThis` binding.
 * @param {string} label Realm description, used in failure messages.
 * @param {boolean} browserLike Whether `window`/`self` alias the realm global,
 * as they do in IE11, or the realm has no global binding at all.
 * @returns {symbol[]} The symbol keys the run left on the realm global.
 */
function renderWithoutGlobalThis(label, browserLike) {
  const sandbox = { console, process, module: { exports: {} } };
  sandbox.exports = sandbox.module.exports;
  sandbox.require = require;
  const context = vm.createContext(sandbox);

  if (browserLike) {
    vm.runInContext(
      'globalThis.window = globalThis; globalThis.self = globalThis;',
      context
    );
  }

  // `globalThis` is a writable, configurable own property of the global
  // object, so removing it leaves the identifier genuinely unresolvable, the
  // way it is on a pre-ES2020 runtime.
  vm.runInContext('delete globalThis.globalThis;', context);
  assert.equal(
    vm.runInContext('typeof globalThis', context),
    'undefined',
    `${label}: the globalThis binding survived, so this realm proves nothing`
  );

  // Checked because the bundle evaluates them: `Symbol` and `Promise` at module
  // scope, `WeakMap` and `Set` on the render path. `Promise` is there for
  // `lib/utils/defer`, not for a revision helper.
  const missing = vm.runInContext(
    `['Symbol', 'WeakMap', 'Set', 'Promise'].filter(function (name) {
       return typeof this[name] !== 'function';
     }, this)`,
    context
  );
  assert.deepEqual(missing, [], `${label}: realm is missing ${missing}`);

  try {
    vm.runInContext(code, context, {
      filename: 'react-instantsearch-core.cjs',
    });
    context.module.exports.render();
  } catch (error) {
    const frame = String(error.stack)
      .split('\n')
      .find((line) => line.includes('react-instantsearch-core.cjs'));
    assert.fail(
      `${label}: rendering <InstantSearch> threw in a realm without globalThis.
  ${error.name}: ${error.message}
  ${frame ? frame.trim() : '<no bundle frame>'}
  The build targets \`ie >= 11\` and injects no polyfills, so a bare
  \`globalThis\` ships as-is. Resolve the realm global through \`typeof\` guards.`
    );
  }

  return browserLike
    ? vm.runInContext('Object.getOwnPropertySymbols(this)', context)
    : [];
}

// IE11 in a browser: no `globalThis`, but `window` and `self` are the global.
const realmKeys = renderWithoutGlobalThis('browser-like realm', true);

// The store must still land on the realm global, so it stays shared with
// anything else in the realm reading the same registered symbol.
assert.ok(
  realmKeys.includes(Symbol.for('InstantSearchChatMessagesSnapshotState')),
  'the chat messages snapshot store must stay on the realm global object, so ' +
    'it is shared with everything reading the same Symbol.for key'
);

// A realm with no global binding at all must degrade, not throw.
renderWithoutGlobalThis('bare realm', false);

console.log(
  'react-instantsearch-core renders without a globalThis binding (ie >= 11 target)'
);
