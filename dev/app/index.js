/* eslint-disable import/default */
import instantsearch from '../../index.js';

import initBuiltInWidgets from './init-builtin-widgets.js';
import initVanillaWidgets from './init-vanilla-widgets.js';
import initJqueryWidgets from './init-jquery-widgets.js';

const search = instantsearch({
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search',
  urlSync: {
    useHash: !(window.history && 'pushState' in window.history),
    mapping: {
      q: 'query',
      hPP: 'hits',
      hFR: 'hierarchical',
    },
  },
});

const q = window.location.search;

switch (true) {
case q.includes('widgets=vanilla'):
  initVanillaWidgets(search);
  break;
case q.includes('widgets=jquery'):
  initJqueryWidgets(search);
  break;
default:
  initBuiltInWidgets(search);
}

search.once('render', () => {
  [...document.querySelectorAll('.smooth-search--hidden')]
    .forEach(element => element.classList.remove('smooth-search--hidden'));
});

search.start();
