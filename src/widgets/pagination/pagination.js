import React from 'react';
import ReactDOM from 'react-dom';
import defaults from 'lodash/object/defaults';
import cx from 'classnames';
import {
  bemHelper,
  getContainerNode
} from '../../lib/utils.js';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import PaginationComponent from '../../components/Pagination/Pagination.js';

let defaultLabels = {
  previous: '‹',
  next: '›',
  first: '«',
  last: '»'
};
let bem = bemHelper('ais-pagination');

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
const usage = `Usage:
pagination({
  container,
  [ cssClasses.{root,item,page,previous,next,first,last,active,disabled}={} ],
  [ labels.{previous,next,first,last} ],
  [ maxPages ],
  [ padding=3 ],
  [ showFirstLast=true ],
  [ autoHideContainer=true ],
  [ scrollTo='body' ]
})`;
function pagination({
    container,
    cssClasses: userCssClasses = {},
    labels = {},
    maxPages,
    padding = 3,
    showFirstLast = true,
    autoHideContainer = true,
    scrollTo = 'body'
  } = {}) {
  if (!container) {
    throw new Error(usage);
  }

  if (scrollTo === true) {
    scrollTo = 'body';
  }

  let containerNode = getContainerNode(container);
  let scrollToNode = scrollTo !== false ? getContainerNode(scrollTo) : false;
  let Pagination = PaginationComponent;
  if (autoHideContainer === true) {
    Pagination = autoHideContainerHOC(Pagination);
  }

  let cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item),
    link: cx(bem('link'), userCssClasses.link),
    page: cx(bem('item', 'page'), userCssClasses.page),
    previous: cx(bem('item', 'previous'), userCssClasses.previous),
    next: cx(bem('item', 'next'), userCssClasses.next),
    first: cx(bem('item', 'first'), userCssClasses.first),
    last: cx(bem('item', 'last'), userCssClasses.last),
    active: cx(bem('item', 'active'), userCssClasses.active),
    disabled: cx(bem('item', 'disabled'), userCssClasses.disabled)
  };

  labels = defaults(labels, defaultLabels);

  return {
    init({helper}) {
      this.setCurrentPage = page => {
        helper.setCurrentPage(page);
        if (scrollToNode !== false) {
          scrollToNode.scrollIntoView();
        }
        helper.search();
      };
    },

    getMaxPage: function(results) {
      if (maxPages !== undefined) {
        return Math.min(maxPages, results.nbPages);
      }
      return results.nbPages;
    },

    render: function({results, state, createURL}) {
      ReactDOM.render(
        <Pagination
          createURL={(page) => createURL(state.setPage(page))}
          cssClasses={cssClasses}
          currentPage={results.page}
          labels={labels}
          nbHits={results.nbHits}
          nbPages={this.getMaxPage(results)}
          padding={padding}
          setCurrentPage={this.setCurrentPage}
          shouldAutoHideContainer={results.nbHits === 0}
          showFirstLast={showFirstLast}
        />,
        containerNode
      );
    }
  };
}

export default pagination;
