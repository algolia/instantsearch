/* eslint-disable no-console */

const assert = require('assert');

const VueInstantSearch2Root = require('vue-instantsearch');
const VueInstantSearch2 = require('vue-instantsearch/vue2');

assert.ok(VueInstantSearch2);
assert.ok(VueInstantSearch2.AisSearchBox);
assert.strictEqual(VueInstantSearch2Root.AisSearchBox, VueInstantSearch2.AisSearchBox);

// instantsearch-core's public API is re-exported
assert.strictEqual(typeof VueInstantSearch2.historyRouter, 'function');
assert.strictEqual(typeof VueInstantSearch2.connectHits, 'function');
assert.strictEqual(typeof VueInstantSearch2.createInsightsMiddleware, 'function');

// unexported paths are not reachable
assert.throws(() => require('vue-instantsearch/vue2/es/src/instantsearch.js'), {
  code: 'ERR_PACKAGE_PATH_NOT_EXPORTED',
});

console.log('vue-instantsearch/vue2 is valid CJS');
