'use strict';

// #region sidebar
sidebar({
  headersContainer: document.querySelector('.documentation-container'),
  sidebarContainer: document.querySelector('.sidebar'),
  headerStartLevel: 2
});

function sidebar(options) {
  const {headersContainer, sidebarContainer} = options;

  if (!headersContainer || !sidebarContainer) {
    return;
  }

  const list = document.createElement('ul');
  list.classList.add('no-mobile');

  sidebarContainer.appendChild(list);

  sidebarFollowScroll(sidebarContainer.firstChild);
  activeLinks(sidebarContainer);
  scrollSpy(sidebarContainer, headersContainer);
}

function sidebarFollowScroll(sidebarContainer) {
  const {height, footerHeight, menuHeight, sidebarTop} =
    getPositionsKeyElements(sidebarContainer);
  function positionSidebar() {
    const currentScroll = window.pageYOffset;
    if (currentScroll > sidebarTop) {
      const fold = height - footerHeight - menuHeight - 50;
      if (currentScroll > fold) {
        sidebarContainer.style.top = fold - currentScroll + 'px';
      } else {
        sidebarContainer.style.top = null;
      }
      sidebarContainer.classList.add('fixed');
    } else {
      sidebarContainer.classList.remove('fixed');
    }
  }

  window.addEventListener('load', positionSidebar);
  document.addEventListener('DOMContentLoaded', positionSidebar);
  document.addEventListener('scroll', positionSidebar);
}

function scrollSpy(sidebarContainer, headersContainer) {
  const headers = [...headersContainer.querySelectorAll('h2, h3')];

  const setActiveSidebarLink = (header) => {
    [...sidebarContainer.querySelectorAll('a')].forEach((item) => {
      if (item.getAttribute('href').slice(1) === header.getAttribute('id')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  };

  const findActiveSidebarLink = () => {
    const highestVisibleHeaders = headers
      .map((header) => ({
        element: header,
        rect: header.getBoundingClientRect()
      }))
      .filter(({rect}) => {
        // top element relative viewport position should be at least 1/3 viewport
        // and element should be in viewport
        return (
          rect.top < window.innerHeight / 3 && rect.bottom < window.innerHeight
        );
      })
      // then we take the closest to this position as reference
      .sort((header1, header2) =>
        Math.abs(header1.rect.top) < Math.abs(header2.rect.top) ? -1 : 1
      );

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

  linksContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      [...linksContainer.querySelectorAll('a')].forEach((item) =>
        item.classList.remove('active')
      );
      e.target.classList.add('active');
    }
  });
}

function getPositionsKeyElements(sidebarContainer) {
  const sidebarBBox = sidebarContainer.getBoundingClientRect();
  const bodyBBox = document.body.getBoundingClientRect();
  const sidebarTop = sidebarBBox.top - bodyBBox.top;
  const footer = document.querySelector('.ac-footer');
  const menu = document.querySelector('.sidebar > ul');
  const height = document.querySelector('html').getBoundingClientRect().height;
  const footerHeight = footer.offsetHeight;
  const menuHeight = menu.offsetHeight;

  return {sidebarTop, height, footerHeight, menuHeight};
}
// #endregion sidebar

// #region nav
const mobileMenuButton = document.querySelector('.algc-openmobile ');
const mobileMenu = document.querySelector('.algc-mobilemenu');

mobileMenuButton.addEventListener('click', function toggleMobileMenu() {
  mobileMenuButton.classList.toggle('algc-openmobile--open');
  mobileMenu.classList.toggle('algc-mobilemenu--open');
});
// #endregion nav
