import sidebar from './sidebar.js';

const container = document.querySelector('.documentation-container');
const sidebarContainer = document.querySelector('.sidebar');

if (container && sidebar) {
  sidebar({
    headersContainer: container,
    sidebarContainer,
    headerStartLevel: 2,
  });
}
