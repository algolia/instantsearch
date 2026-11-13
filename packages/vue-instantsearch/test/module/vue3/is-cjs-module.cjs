/* eslint-disable no-console */

const assert = require('assert');

const VueInstantSearch3 = require('vue-instantsearch/vue3');

assert.ok(VueInstantSearch3);
assert.ok(VueInstantSearch3.AisSearchBox);

// instantsearch-core's public API is re-exported
assert.strictEqual(typeof VueInstantSearch3.historyRouter, 'function');
assert.strictEqual(typeof VueInstantSearch3.connectHits, 'function');
assert.strictEqual(typeof VueInstantSearch3.createInsightsMiddleware, 'function');

// unexported paths are not reachable
assert.throws(() => require('vue-instantsearch/vue3/es/src/instantsearch.js'), {
  code: 'ERR_PACKAGE_PATH_NOT_EXPORTED',
});

console.log('vue-instantsearch/vue3 is valid CJS');
