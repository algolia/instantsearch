import { registerDisposer, start } from 'dev-novel';
import initBuiltInWidgets from './builtin/init-stories';
import initJqueryWidgets from './jquery/init-stories';
import initVanillaWidgets from './vanilla/init-stories';
import initUnmountWidgets from './init-unmount-widgets.js';

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
  case q.includes('widgets=unmount'):
    initUnmountWidgets();
    break;
  default:
    initBuiltInWidgets();
}

start({
  projectName: 'instantsearch.js',
  projectLink: 'https://community.algolia.com/instantsearch.js/',
});
