export default function sidebar(options) {
  const {headersContainer, sidebarContainer, headerStartLevel} = options;
  listenToChanges(options);

  const headers = headersContainer.querySelectorAll('h2, h3');
  //const select = document.createElement('select');
  const list = document.createElement('ul');
  const startLevel = headerStartLevel; // we start at h2
  list.classList.add('no-mobile');
  let currentList = list;
  let currentLevel = startLevel;
  
  //select.addEventListener('change', e => window.location = e.target.value);
  sidebarContainer.appendChild(list);
  //sidebarContainer.appendChild(select);
  sidebarFollowScroll(sidebarContainer.firstChild);
  activeLinks(sidebarContainer);
  scrollSpy(sidebarContainer, headersContainer);
}

function listenToChanges(originalParameters) {
  const {headersContainer, sidebarContainer, headerStartLevel} = originalParameters;

}

function sidebarFollowScroll(sidebarContainer) {
  const {height, navHeight, footerHeight, menuHeight, sidebarTop} = getPositionsKeyElements(sidebarContainer);
  const positionSidebar = () => {

    const currentScroll = window.pageYOffset;
    if (currentScroll > sidebarTop - navHeight) {
      const fold = height - footerHeight - menuHeight - 50;
      if (currentScroll > fold) {
        sidebarContainer.style.top = (fold - currentScroll + navHeight) + 'px';
      } else {
        sidebarContainer.style.top = null;
      }
      sidebarContainer.classList.add('fixed');
    } else {
      sidebarContainer.classList.remove('fixed');
    }
  };

  window.addEventListener('load', positionSidebar);
  document.addEventListener('DOMContentLoaded', positionSidebar);
  document.addEventListener('scroll', positionSidebar);
}

function scrollSpy(sidebarContainer, headersContainer) {
  const headers = [...headersContainer.querySelectorAll('h2, h3')];

  const setActiveSidebarLink = header => {
    [...sidebarContainer.querySelectorAll('a')].forEach(item => {
      if (item.getAttribute('href').slice(1) === header.getAttribute('id')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  };

  const findActiveSidebarLink = () => {
    const highestVisibleHeaders = headers
      .map(header => ({element: header, rect: header.getBoundingClientRect()}))
      .filter(({rect}) => {
        // top element relative viewport position should be at least 1/3 viewport
        // and element should be in viewport
        return rect.top < window.innerHeight / 3 && rect.bottom < window.innerHeight;
      })
      // then we take the closest to this position as reference
      .sort((header1, header2) => Math.abs(header1.rect.top) < Math.abs(header2.rect.top) ? -1 : 1);

    if (highestVisibleHeaders.length === 0) {
      setActiveSidebarLink(headers[0]);
      return;
    }

    setActiveSidebarLink(highestVisibleHeaders[0].element);
  };

  findActiveSidebarLink();
  window.addEventListener('load', findActiveSidebarLink);
  document.addEventListener('DOMContentLoaded', findActiveSidebarLink);
  document.addEventListener('scroll', findActiveSidebarLink);
}

// The Following code is used to set active items
// On the documentation sidebar depending on the
// clicked item
function activeLinks(sidebarContainer) {
  const linksContainer = sidebarContainer.querySelector('ul');

  linksContainer.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      [...linksContainer.querySelectorAll('a')].forEach(item => item.classList.remove('active'));
      e.target.classList.add('active');
    }
  });
}

function getPositionsKeyElements(sidebar) {
  const sidebarBBox = sidebar.getBoundingClientRect();
  const bodyBBox = document.body.getBoundingClientRect();
  const sidebarTop = sidebarBBox.top - bodyBBox.top;
  const footer = document.querySelector('.ac-footer');
  const navigation = document.querySelector('.ac-nav');
  const menu = document.querySelector('.sidebar > ul');
  const height = document.querySelector('html').getBoundingClientRect().height;
  const navHeight = navigation.offsetHeight;
  const footerHeight = footer.offsetHeight;
  const menuHeight = menu.offsetHeight;

  return {sidebarTop, height, navHeight, footerHeight, menuHeight};
}
