/**
 * Fixes a sidebar in the boundaries of its parent
 */
export default function fixSidebar({sidebarContainer, topOffset}) {
  const siderbarParent = sidebarContainer.parentElement;
  const sidebarContent = sidebarContainer.firstChild;
  const boundaries = getStartStopBoundaries(siderbarParent, sidebarContent, topOffset);
  const sidebarBBox = sidebarContainer.getBoundingClientRect();

  const positionSidebar = () => {
    const currentScroll = window.pageYOffset;
    const {start, stop} = boundaries;
    if(currentScroll > boundaries.start) {
      if(currentScroll > boundaries.stop) {
        const sideberTopPos = stop - currentScroll + topOffset;
        sidebarContainer.style.top = `${sideberTopPos}px`;
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

function getStartStopBoundaries(parent, content, topOffset) {
  const bbox = parent.getBoundingClientRect();
  const bodyBbox = document.body.getBoundingClientRect();
  const contentBbox = content.getBoundingClientRect();

  const start = bbox.top - bodyBbox.top - topOffset;
  return {
    start,
    stop: bbox.height - contentBbox.height,
  };
}
