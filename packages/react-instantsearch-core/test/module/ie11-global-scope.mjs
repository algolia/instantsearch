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
// polyfills (`scripts/build/rollup.plugins.mjs`), so anything those helpers
// reach for must be probed with `typeof`: directly reading a missing global
// binding throws.
//
// This drives the built package through modern realms with bindings removed,
// which is narrower than an IE11 emulation. Jest cannot cover it: the root
// `moduleNameMapper` rewrites `instantsearch.js/es/*` back to TypeScript
// sources, so a unit test never sees the downlevelled output.

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
 * @param {string[]} unbound Further globals to remove before the bundle runs.
 * @returns {Array<symbol | string>} The own keys the run left on the realm
 * global.
 */
function renderWithoutGlobalThis(label, browserLike, unbound = []) {
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

  unbound.forEach((name) => {
    vm.runInContext(`delete globalThis.${name};`, context);
    assert.equal(
      vm.runInContext(`typeof ${name}`, context),
      'undefined',
      `${label}: the ${name} binding survived, so this realm proves nothing`
    );
  });

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
  const expected = ['Symbol', 'WeakMap', 'Set', 'Promise'].filter(
    (name) => !unbound.includes(name)
  );
  const missing = vm.runInContext(
    `${JSON.stringify(expected)}.filter(function (name) {
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
      `${label}: rendering <InstantSearch> threw in a realm without ${[
        'globalThis',
        ...unbound,
      ].join(', ')}.
  ${error.name}: ${error.message}
  ${frame ? frame.trim() : '<no bundle frame>'}
  The build targets \`ie >= 11\` and injects no polyfills, so an absent global
  ships as a bare reference. Probe it with \`typeof\` and degrade instead.`
    );
  }

  return browserLike
    ? vm.runInContext(
        `Object.getOwnPropertySymbols(this).concat(
           Object.getOwnPropertyNames(this)
         )`,
        context
      )
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

// The polyfills the React InstantSearch installation guide asks IE11 users to
// load do not include these, so a plain `<InstantSearch>` root — no Chat widget
// anywhere — must still render without them. The Chat message revision helpers
// need them and run on that root, so they have to degrade rather than take the
// whole root down with them.
renderWithoutGlobalThis('documented IE11 polyfill set', true, [
  'Symbol',
  'WeakMap',
  'WeakRef',
  'Set',
]);

// A realm polyfilled far enough to keep the revision helpers working, but with
// no `Symbol`, keys the store with a string instead.
const stringKeyedRealmKeys = renderWithoutGlobalThis(
  'realm without Symbol',
  true,
  ['Symbol']
);

// Same requirement as the registered symbol above, and all this realm shows:
// the store is reachable on the realm global under that key. Whether a second
// copy of the module then resolves to it is not exercised here.
assert.ok(
  stringKeyedRealmKeys.includes('InstantSearchChatMessagesSnapshotState'),
  'without Symbol the chat messages snapshot store must stay on the realm ' +
    'global object, under the string key the module falls back to'
);

console.log(
  'react-instantsearch-core renders on the documented legacy runtime (ie >= 11 target)'
);
