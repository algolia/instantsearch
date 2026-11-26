/* eslint-disable no-console */

import assert from 'assert';

import VueInstantSearch3Plugin, * as VueInstantSearch3 from 'vue-instantsearch/vue3';
import * as Vue3Es from 'vue-instantsearch/vue3/es';
import * as Vue3Widgets from 'vue-instantsearch/vue3/es/src/widgets.js';

assert.ok(VueInstantSearch3);
assert.ok(Vue3Widgets);
assert.ok(Vue3Es);
assert.strictEqual(typeof VueInstantSearch3Plugin.install, 'function');
assert.strictEqual(Vue3Es.AisSearchBox, VueInstantSearch3.AisSearchBox);

// instantsearch-core's public API is re-exported (also guards against
// colliding names being silently dropped by the star export)
assert.ok(VueInstantSearch3.AisSearchBox);
assert.strictEqual(typeof VueInstantSearch3.historyRouter, 'function');
assert.strictEqual(typeof VueInstantSearch3.connectHits, 'function');
assert.strictEqual(typeof VueInstantSearch3.createInsightsMiddleware, 'function');

// unexported paths are not reachable
await assert.rejects(
  () => import('vue-instantsearch/vue3/es/src/instantsearch.js'),
  { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' }
);

console.log('vue-instantsearch/vue3 is valid ESM');
