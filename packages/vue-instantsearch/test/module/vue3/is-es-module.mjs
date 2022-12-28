/* eslint-disable no-console */

import assert from 'assert';

import * as VueInstantSearch3 from 'vue-instantsearch/vue3/es/index.js';
import * as Vue3Widgets from 'vue-instantsearch/vue3/es/src/widgets.js';

assert.ok(VueInstantSearch3);
assert.ok(Vue3Widgets);

console.log('vue-instantsearch/vue3 is valid ESM');
