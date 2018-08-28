import dropdowns from './dropdowns';
import move from './mover';
import activateClipboard from './activateClipboard';
import { fixSidebar, followSidebarNavigation } from './fix-sidebar';
import alg from 'algolia-frontend-components/javascripts';
import './editThisPage';

const docSearch = {
  apiKey: '5cb6763f264e31381e18639a1147634c',
  indexName: 'react-instantsearch',
  inputSelector: '#searchbox',
};

/* eslint-disable no-unused-vars */
/* eslint-disable new-cap */
const header = new alg.communityHeader(docSearch);

const container = document.querySelector('.documentation-container');
const codeSamples = document.querySelectorAll('.code-sample');

dropdowns();
move();
activateClipboard(codeSamples);
// bindRunExamples(codeSamples);

const sidebarContainer = document.querySelector('.sidebar');
if (sidebarContainer) {
  const headerHeight = document
    .querySelector('.algc-navigation')
    .getBoundingClientRect().height;
  const contentContainer = document.querySelector('.documentation-container');
  fixSidebar({
    sidebarContainer,
    topOffset: headerHeight,
    contentContainer: container,
  });
  followSidebarNavigation(
    sidebarContainer.querySelectorAll('a'),
    contentContainer.querySelectorAll('h2')
  );
}

// The Following function will make the '.sidebar-opener'
// clickable and it will open/close the sidebar on the
// documentations

function toggleDocumentationSidebar() {
  const sidebarNav = document.querySelector('nav.sidebar');
  const trigger = document.querySelector('.sidebar-opener');

  function init() {
    const bodySize = document.body.clientWidth;
    if (bodySize <= 960 && sidebarNav) {
      trigger.addEventListener('click', () => {
        sidebarNav.classList.toggle('Showed');
        trigger.classList.toggle('Showed');
      });
    }
  }
  init();
}
toggleDocumentationSidebar();

window.addEventListener('resize', () => {
  toggleDocumentationSidebar();
});
