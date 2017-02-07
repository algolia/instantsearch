import React from 'react';
import ReactDOM from 'react-dom';
import Pagination from '../../components/Pagination/Pagination.js';
import connectPagination from '../../connectors/pagination/connectPagination.js';

/**
 * Add a pagination menu to navigate through the results
 * @function pagination
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.labels] Text to display in the various links (prev, next, first, last)
 * @param  {string} [options.labels.previous] Label for the Previous link
 * @param  {string} [options.labels.next] Label for the Next link
 * @param  {string} [options.labels.first] Label for the First link
 * @param  {string} [options.labels.last] Label for the Last link
 * @param  {number} [options.maxPages] The max number of pages to browse
 * @param  {number} [options.padding=3] The number of pages to display on each side of the current page
 * @param  {string|DOMElement|boolean} [options.scrollTo='body'] Where to scroll after a click, set to `false` to disable
 * @param  {boolean} [options.showFirstLast=true] Define if the First and Last links should be displayed
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS classes added to the parent `<ul>`
 * @param  {string|string[]} [options.cssClasses.item] CSS classes added to each `<li>`
 * @param  {string|string[]} [options.cssClasses.link] CSS classes added to each link
 * @param  {string|string[]} [options.cssClasses.page] CSS classes added to page `<li>`
 * @param  {string|string[]} [options.cssClasses.previous] CSS classes added to the previous `<li>`
 * @param  {string|string[]} [options.cssClasses.next] CSS classes added to the next `<li>`
 * @param  {string|string[]} [options.cssClasses.first] CSS classes added to the first `<li>`
 * @param  {string|string[]} [options.cssClasses.last] CSS classes added to the last `<li>`
 * @param  {string|string[]} [options.cssClasses.active] CSS classes added to the active `<li>`
 * @param  {string|string[]} [options.cssClasses.disabled] CSS classes added to the disabled `<li>`
 * @return {Object}
 */
export default connectPagination(defaultRendering);

function defaultRendering({
  createURL,
  cssClasses,
  currentPage,
  labels,
  nbHits,
  nbPages,
  padding,
  setCurrentPage,
  shouldAutoHideContainer,
  showFirstLast,
  containerNode,
}, isFirstRendering) {
  if (isFirstRendering) return;
  ReactDOM.render(
    <Pagination
      createURL={createURL}
      cssClasses={cssClasses}
      currentPage={currentPage}
      labels={labels}
      nbHits={nbHits}
      nbPages={nbPages}
      padding={padding}
      setCurrentPage={setCurrentPage}
      shouldAutoHideContainer={shouldAutoHideContainer}
      showFirstLast={showFirstLast}
    />,
    containerNode
  );
}
