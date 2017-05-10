import sidebar from './sidebar.js';
import dropdowns from './dropdowns.js';
import move from './mover.js';
var alg = require('algolia-frontend-components/javascripts.js');

const docSearch = {
  apiKey: 'fd5e835f5153cad7d5ec0c3595dfa244',
  indexName: 'instantsearch.js-v2',
  inputSelector: '#searchbox',
};

const header = new alg.communityHeader(docSearch);

const container = document.querySelector('.documentation-container');
const sidebarContainer = document.querySelector('.sidebar');

dropdowns();
move();
