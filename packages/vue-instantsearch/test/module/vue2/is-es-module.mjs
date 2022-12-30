/* eslint-disable no-console */

import assert from 'assert';

import * as VueInstantSearch2 from 'vue-instantsearch/vue2/es/index.js';
import * as Vue2Widgets from 'vue-instantsearch/vue2/es/src/widgets.js';

assert.ok(VueInstantSearch2);
assert.ok(Vue2Widgets);

console.log('vue-instantsearch/vue2 is valid ESM');
