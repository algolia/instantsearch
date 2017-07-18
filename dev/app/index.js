/* eslint-disable import/default */
import {registerDisposer, start} from 'dev-novel';

import initBuiltInWidgets from './init-builtin-widgets.js';
import initVanillaWidgets from './init-vanilla-widgets.js';
import initJqueryWidgets from './init-jquery-widgets.js';

import '../style.css';
import '../../src/css/instantsearch.scss';
import '../../src/css/instantsearch-theme-algolia.scss';

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
