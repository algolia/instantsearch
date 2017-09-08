import defaults from 'lodash/defaults';

import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import Pagination from '../../components/Pagination/Pagination.js';
import connectPagination from '../../connectors/pagination/connectPagination.js';

import { bemHelper, getContainerNode } from '../../lib/utils.js';

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
}) => (
  { createURL, currentRefinement, nbHits, nbPages, refine },
  isFirstRendering
) => {
  if (isFirstRendering) return;

  const setCurrrentPage = pageNumber => {
    refine(pageNumber);

    if (scrollToNode !== false) {
      scrollToNode.scrollIntoView();
    }
  };

  const shouldAutoHideContainer = autoHideContainer && nbHits === 0;

  ReactDOM.render(
    <Pagination
      createURL={createURL}
      cssClasses={cssClasses}
      currentPage={currentRefinement}
      labels={labels}
      nbHits={nbHits}
      nbPages={nbPages}
      padding={padding}
      setCurrentPage={setCurrrentPage}
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
 * @typedef {Object} PaginationCSSClasses
 * @property  {string|string[]} [root] CSS classes added to the parent `<ul>`.
 * @property  {string|string[]} [item] CSS classes added to each `<li>`.
 * @property  {string|string[]} [link] CSS classes added to each link.
 * @property  {string|string[]} [page] CSS classes added to page `<li>`.
 * @property  {string|string[]} [previous] CSS classes added to the previous `<li>`.
 * @property  {string|string[]} [next] CSS classes added to the next `<li>`.
 * @property  {string|string[]} [first] CSS classes added to the first `<li>`.
 * @property  {string|string[]} [last] CSS classes added to the last `<li>`.
 * @property  {string|string[]} [active] CSS classes added to the active `<li>`.
 * @property  {string|string[]} [disabled] CSS classes added to the disabled `<li>`.
 */

/**
 * @typedef {Object} PaginationLabels
 * @property  {string} [previous] Label for the Previous link.
 * @property  {string} [next] Label for the Next link.
 * @property  {string} [first] Label for the First link.
 * @property  {string} [last] Label for the Last link.
 */

/**
 * @typedef {Object} PaginationWidgetOptions
 * @property  {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property  {number} [maxPages] The max number of pages to browse.
 * @property  {number} [padding=3] The number of pages to display on each side of the current page.
 * @property  {string|HTMLElement|boolean} [scrollTo='body'] Where to scroll after a click, set to `false` to disable.
 * @property  {boolean} [showFirstLast=true] Define if the First and Last links should be displayed.
 * @property  {boolean} [autoHideContainer=true] Hide the container when no results match.
 * @property  {PaginationLabels} [labels] Text to display in the various links (prev, next, first, last).
 * @property  {PaginationCSSClasses} [cssClasses] CSS classes to be added.
 */

/**
 * The pagination widget allow the user to switch between pages of the results.
 *
 * This is an alternative to using the *show more* pattern, that allows the user
 * only to display more items. The *show more* pattern is usually prefered
 * because it is simpler to use, and it is more convenient in a mobile context.
 * See the infinite hits widget, for more informations.
 * @type {WidgetFactory}
 * @category navigation
 * @param {PaginationWidgetOptions} $0 Options for the Pagination widget.
 * @return {Widget} A new instance of Pagination widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.pagination({
 *     container: '#pagination-container',
 *     maxPages: 20,
 *     // default is to scroll to 'body', here we disable this behavior
 *     scrollTo: false,
 *     showFirstLast: false,
 *   })
 * );
 */
export default function pagination(
  {
    container,
    labels: userLabels = defaultLabels,
    cssClasses: userCssClasses = {},
    maxPages,
    padding = 3,
    showFirstLast = true,
    autoHideContainer = true,
    scrollTo: userScrollTo = 'body',
  } = {}
) {
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
    return makeWidget({ maxPages });
  } catch (e) {
    throw new Error(usage);
  }
}
