/**
 * Fixes a sidebar in the boundaries of its parent
 * @param {object} $0 options to init the fixed sidebar
 * @param {HTMLElement} $0.sidebarContainer the holder of the menu
 * @param {topOffset} $0.topOffset an optional top offset for sticky menu
 * @returns {void}
 */
export function fixSidebar({ sidebarContainer, topOffset, contentContainer }) {
  const sidebarParent = sidebarContainer.parentElement;
  let boundaries = getStartStopBoundaries(
    sidebarParent,
    sidebarContainer,
    topOffset
  );

  // If the sidebar is too big for the page, let's not change anyething
  if (isSidebarBiggerThanContent({ sidebarContainer, contentContainer }))
    return;

  sidebarParent.style.position = 'relative';

  const positionSidebar = () => {
    const currentScroll = window.pageYOffset;
    const { start, stop } = boundaries;
    if (currentScroll > start) {
      if (currentScroll > stop) {
        sidebarContainer.style.position = 'absolute';
        sidebarContainer.style.bottom = `0`;
        sidebarContainer.classList.remove('fixed');
      } else {
        sidebarContainer.style.position = null;
        sidebarContainer.style.bottom = null;
        sidebarContainer.classList.add('fixed');
      }
    } else {
      sidebarContainer.classList.remove('fixed');
    }
  };

  const updateBoundaries = () => {
    boundaries = getStartStopBoundaries(
      sidebarParent,
      sidebarContainer,
      topOffset
    );
  };

  window.addEventListener('load', updateBoundaries);
  document.addEventListener('DOMContentLoaded', updateBoundaries);

  document.addEventListener('scroll', positionSidebar);

  window.updateBoundaries = updateBoundaries; // DOES NOT WORK :(

  updateBoundaries();
  positionSidebar();
}

/**
 * Defines the limits where to start or stop the stickiness
 * @param {HTMLElement} parent the outer container of the sidebar
 * @param {HTMLElement} sidebar the sidebar
 * @param {number} topOffset an optional top offset for sticky menu
 * @returns {void}
 */
function getStartStopBoundaries(parent, sidebar, topOffset) {
  const bbox = parent.getBoundingClientRect();
  const sidebarBbox = sidebar.getBoundingClientRect();
  const bodyBbox = document.body.getBoundingClientRect();

  const containerAbsoluteTop = bbox.top - bodyBbox.top;
  const sidebarAbsoluteTop = sidebarBbox.top - bodyBbox.top;
  const marginTop = sidebarAbsoluteTop - containerAbsoluteTop;
  const start = containerAbsoluteTop - topOffset;
  const stop =
    bbox.height +
    containerAbsoluteTop -
    sidebarBbox.height -
    marginTop -
    topOffset;

  return {
    start,
    stop,
  };
}

export function followSidebarNavigation(sidebarLinks, contentHeaders) {
  const links = [...sidebarLinks];
  const headers = [...contentHeaders];

  const setActiveSidebarLink = header => {
    links.forEach(item => {
      const currentHref = item.getAttribute('href');
      const anchorToFind = `#${header.getAttribute('id')}`;
      const isCurrentHeader = currentHref.indexOf(anchorToFind) !== -1;
      if (isCurrentHeader) {
        item.classList.add('navItem-active');
      } else {
        item.classList.remove('navItem-active');
      }
    });
  };

  const findActiveSidebarLink = () => {
    const highestVisibleHeaders = headers
      .map(header => ({
        element: header,
        rect: header.getBoundingClientRect(),
      }))
      .filter(
        ({ rect }) =>
          rect.top < window.innerHeight / 3 && rect.bottom < window.innerHeight
        // top element relative viewport position should be at least 1/3 viewport
        // and element should be in viewport
      )
      // then we take the closest to this position as reference
      .sort((header1, header2) =>
        Math.abs(header1.rect.top) < Math.abs(header2.rect.top) ? -1 : 1
      );

    if (headers[0] && highestVisibleHeaders.length === 0) {
      setActiveSidebarLink(headers[0]);
      return;
    }

    if (highestVisibleHeaders[0]) {
      setActiveSidebarLink(highestVisibleHeaders[0].element);
    }
  };

  findActiveSidebarLink();
  window.addEventListener('load', findActiveSidebarLink);
  document.addEventListener('DOMContentLoaded', findActiveSidebarLink);
  document.addEventListener('scroll', findActiveSidebarLink);
}

function isSidebarBiggerThanContent({ sidebarContainer, contentContainer }) {
  const sidebarHeight = sidebarContainer.getBoundingClientRect().height;
  const contentHeight = contentContainer.getBoundingClientRect().height;

  return sidebarHeight >= contentHeight;
}
