import sidebar from './sidebar.js';
import dropdowns from './dropdowns.js';
import move from './mover.js';
import activateClipboard from './activateClipboard.js';
import bindRunExamples from './bindRunExamples.js';

var alg = require('algolia-frontend-components/javascripts.js');

const docSearch = {
  apiKey: '64eb3d69b6fb84f3c04a24224b6268a7',
  indexName: 'instantsearchjs-v2',
  inputSelector: '#searchbox',
};

const header = new alg.communityHeader(docSearch);

const container = document.querySelector('.documentation-container');
const sidebarContainer = document.querySelector('.sidebar');
const codeSamples = document.querySelectorAll('.code-sample');

dropdowns();
move();
activateClipboard(codeSamples);
bindRunExamples(codeSamples);
