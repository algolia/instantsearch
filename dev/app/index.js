import { registerDisposer, start } from 'dev-novel';
import initBuiltInWidgets from './builtin/init-stories';
import initJqueryWidgets from './jquery/init-stories';
import initUnmountWidgets from './init-unmount-widgets.js';

import '../style.css';
import '../../src/css/instantsearch.scss';
import '../../src/css/instantsearch-theme-algolia.scss';

registerDisposer(() => {
  window.search = undefined;
  delete window.search;
});

const q = window.location.search;

let selectedTab = '';
switch (true) {
  case q.includes('widgets=jquery'):
    initJqueryWidgets();
    selectedTab = 'jquery';
    break;
  case q.includes('widgets=unmount'):
    initUnmountWidgets();
    selectedTab = 'unmount';
    break;
  default:
    initBuiltInWidgets();
}

const selectStories = document.createElement('div');
selectStories.className = 'story-selector';
selectStories.innerHTML = `
  <a href="?" class="tab ${selectedTab === '' ? 'active' : ''}">Built-in</a>
  <a href="?widgets=jquery" class="tab ${
    selectedTab === 'jquery' ? 'active' : ''
  }">Connectors with jQuery</a>
  <a href="?widgets=unmount" class="tab ${
    selectedTab === 'unmount' ? 'active' : ''
  }">Disposable widgets</a>
`;
document.body.appendChild(selectStories);

start({
  projectName: 'instantsearch.js',
  projectLink: 'https://community.algolia.com/instantsearch.js/',
});
