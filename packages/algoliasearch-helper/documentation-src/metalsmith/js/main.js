import sidebar from './sidebar.js';

var container = document.querySelector('.documentation-container')
var sidebarContainer = document.querySelector('.sidebar');

if(container && sidebar) {
  sidebar({
    headersContainer: container,
    sidebarContainer: sidebarContainer,
    headerStartLevel: 2
  });
}
