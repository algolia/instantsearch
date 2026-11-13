/* eslint-disable no-console */

import assert from 'assert';

import * as Vue2Root from 'vue-instantsearch';
import VueInstantSearch2Plugin, * as VueInstantSearch2 from 'vue-instantsearch/vue2';
import * as Vue2Es from 'vue-instantsearch/vue2/es';
import * as Vue2Widgets from 'vue-instantsearch/vue2/es/src/widgets.js';

assert.ok(VueInstantSearch2);
assert.ok(Vue2Widgets);
assert.ok(Vue2Root);
assert.ok(Vue2Es);
assert.strictEqual(typeof VueInstantSearch2Plugin.install, 'function');
assert.strictEqual(Vue2Es.AisSearchBox, VueInstantSearch2.AisSearchBox);

// instantsearch-core's public API is re-exported (also guards against
// colliding names being silently dropped by the star export)
assert.ok(VueInstantSearch2.AisSearchBox);
assert.strictEqual(typeof VueInstantSearch2.historyRouter, 'function');
assert.strictEqual(typeof VueInstantSearch2.connectHits, 'function');
assert.strictEqual(typeof VueInstantSearch2.createInsightsMiddleware, 'function');

// unexported paths are not reachable
await assert.rejects(
  () => import('vue-instantsearch/vue2/es/src/instantsearch.js'),
  { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' }
);

console.log('vue-instantsearch/vue2 is valid ESM');
