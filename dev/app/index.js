/* eslint-disable import/default */
import {registerInitializer, registerDisposer, start} from 'dev-novel';

import instantsearch from '../../index.js';

import initBuiltInWidgets from './init-builtin-widgets.js';
import initVanillaWidgets from './init-vanilla-widgets.js';
import initJqueryWidgets from './init-jquery-widgets.js';

registerInitializer(() => {
  window.search = instantsearch({
    appId: 'latency',
    apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
    indexName: 'instant_search',
    searchParameters: {
      hitsPerPage: 3,
    },
  });
});

registerDisposer(() => {
  window.search = undefined;
  delete window.search;
});

const q = window.location.search;

switch (true) {
case q.includes('widgets=vanilla'):
  initVanillaWidgets();
  break;
case q.includes('widgets=jquery'):
  initJqueryWidgets();
  break;
default:
  initBuiltInWidgets();
}

start({
  projectName: 'instantsearch.js',
  projectLink: 'https://community.algolia.com/instantsearch.js/',
});
