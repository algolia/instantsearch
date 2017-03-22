import defaults from 'lodash/defaults';

import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import Pagination from '../../components/Pagination/Pagination.js';
import connectPagination from '../../connectors/pagination/connectPagination.js';

import {bemHelper, getContainerNode} from '../../lib/utils.js';

const defaultLabels = {
  previous: '‹',
  next: '›',
  first: '«',
  last: '»',
};

const bem = bemHelper('ais-pagination');

const renderer = ({
  containerNode,
  cssClasses,
  labels,
  showFirstLast,
  padding,
  autoHideContainer,
  scrollToNode,
}) => ({
  createURL,
  currentPage,
  nbHits,
  nbPages,
  setPage,
}, isFirstRendering) => {
  if (isFirstRendering) return;

  const setCurrentPage = () => {
    setPage();

    if (scrollToNode !== false) {
      scrollToNode.scrollIntoView();
    }
  };

  const shouldAutoHideContainer = autoHideContainer && nbHits === 0;

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
};

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
 * @return {Object} widget
 */
export default function pagination({
  container,
  labels: userLabels = defaultLabels,
  cssClasses: userCssClasses = {},
  maxPages,
  padding = 3,
  showFirstLast = true,
  autoHideContainer = true,
  scrollTo: userScrollTo = 'body',
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const scrollTo = userScrollTo === true ? 'body' : userScrollTo;
  const scrollToNode = scrollTo !== false ? getContainerNode(scrollTo) : false;

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item),
    link: cx(bem('link'), userCssClasses.link),
    page: cx(bem('item', 'page'), userCssClasses.page),
    previous: cx(bem('item', 'previous'), userCssClasses.previous),
    next: cx(bem('item', 'next'), userCssClasses.next),
    first: cx(bem('item', 'first'), userCssClasses.first),
    last: cx(bem('item', 'last'), userCssClasses.last),
    active: cx(bem('item', 'active'), userCssClasses.active),
    disabled: cx(bem('item', 'disabled'), userCssClasses.disabled),
  };

  const labels = defaults(userLabels, defaultLabels);

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    labels,
    showFirstLast,
    padding,
    autoHideContainer,
    scrollToNode,
  });

  try {
    const makeWidget = connectPagination(specializedRenderer);
    return makeWidget({maxPages});
  } catch (e) {
    throw new Error(usage);
  }
}
