import sidebar from './sidebar.js';
import header from './header.js';
import communityProjects from './communityProjects.js';
import dropdowns from './dropdowns.js';

const container = document.querySelector('.documentation-container');
const sidebarContainer = document.querySelector('.sidebar');

if (container && sidebar) {
  sidebar({
    headersContainer: container,
    sidebarContainer,
    headerStartLevel: 2,
  });
}

header();
communityProjects();
dropdowns();
