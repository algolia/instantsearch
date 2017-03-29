import sidebar from './sidebar.js';
import dropdowns from './dropdowns.js';
import move from './mover.js';
var alg = require('algolia-frontend-components/javascripts.js');

const docSearch = {
  apiKey: 'fd5e835f5153cad7d5ec0c3595dfa244',
  indexName: 'instantsearch-android',
  inputSelector: '#searchbox'
}

const header = new alg.communityHeader(docSearch);

const container = document.querySelector('.documentation-container');
const sidebarContainer = document.querySelector('.sidebar');

if (sidebarContainer) {
  sidebar({
    headersContainer: container,
    sidebarContainer,
    headerStartLevel: 2,
  });
}

dropdowns();
move();
