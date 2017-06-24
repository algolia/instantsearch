/**
 * Fixes a sidebar in the boundaries of its parent
 * @param {object} $0 options to init the fixed sidebar
 * @param {HTMLElement} $0.sidebarContainer the holder of the menu
 * @param {topOffset} $0.topOffset an optional top offset for sticky menu
 */
export default function fixSidebar({sidebarContainer, topOffset}) {
  const siderbarParent = sidebarContainer.parentElement;
  const boundaries = getStartStopBoundaries(siderbarParent, sidebarContainer, topOffset);
  const sidebarBBox = sidebarContainer.getBoundingClientRect();

  siderbarParent.style.position = 'relative';

  const positionSidebar = () => {
    const currentScroll = window.pageYOffset;
    const {start, stop} = boundaries;
    if(currentScroll > boundaries.start) {
      if(currentScroll > boundaries.stop) {
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

  window.addEventListener('load', positionSidebar);
  document.addEventListener('DOMContentLoaded', positionSidebar);
  document.addEventListener('scroll', positionSidebar);
}

/**
 * Defines the limits where to start or stop the stickiness
 * @param {HTMLElement} parent the outer container of the sidebar
 * @param {HTMLElement} sidebar the sidebar
 * @param {number} topOffset an optional top offset for sticky menu
 */
function getStartStopBoundaries(parent, sidebar, topOffset) {
  const bbox = parent.getBoundingClientRect();
  const sidebarBbox = sidebar.getBoundingClientRect();
  const bodyBbox = document.body.getBoundingClientRect();

  const containerAbsoluteTop = bbox.top - bodyBbox.top;
  const sidebarAbsoluteTop = sidebarBbox.top - bodyBbox.top;
  const marginTop = sidebarAbsoluteTop - containerAbsoluteTop;
  const start = containerAbsoluteTop - topOffset;
  const stop = bbox.height + containerAbsoluteTop - sidebarBbox.height - marginTop - topOffset;

  return {
    start,
    stop,
  };
}
