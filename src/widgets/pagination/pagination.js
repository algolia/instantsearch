/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import Pagination from '../../components/Pagination/Pagination';
import connectPagination from '../../connectors/pagination/connectPagination';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';

const withUsage = createDocumentationMessageGenerator({ name: 'pagination' });
const suit = component('Pagination');

const defaultTemplates = {
  previous: '‹',
  next: '›',
  first: '«',
  last: '»',
};

const renderer = ({
  containerNode,
  cssClasses,
  templates,
  totalPages,
  showFirst,
  showLast,
  showPrevious,
  showNext,
  scrollToNode,
}) => (
  {
    createURL,
    currentRefinement,
    nbHits,
    nbPages,
    pages,
    isFirstPage,
    isLastPage,
    refine,
  },
  isFirstRendering
) => {
  if (isFirstRendering) return;

  const setCurrentPage = pageNumber => {
    refine(pageNumber);

    if (scrollToNode !== false) {
      scrollToNode.scrollIntoView();
    }
  };

  render(
    <Pagination
      createURL={createURL}
      cssClasses={cssClasses}
      currentPage={currentRefinement}
      templates={templates}
      nbHits={nbHits}
      nbPages={nbPages}
      pages={pages}
      totalPages={totalPages}
      isFirstPage={isFirstPage}
      isLastPage={isLastPage}
      setCurrentPage={setCurrentPage}
      showFirst={showFirst}
      showLast={showLast}
      showPrevious={showPrevious}
      showNext={showNext}
    />,
    containerNode
  );
};

/**
 * @typedef {Object} PaginationCSSClasses
 * @property  {string|string[]} [root] CSS classes added to the root element of the widget.
 * @property {string|string[]} [noRefinementRoot] CSS class to add to the root element of the widget if there are no refinements.
 * @property  {string|string[]} [list] CSS classes added to the wrapping `<ul>`.
 * @property  {string|string[]} [item] CSS classes added to each `<li>`.
 * @property  {string|string[]} [firstPageItem] CSS classes added to the first `<li>`.
 * @property  {string|string[]} [lastPageItem] CSS classes added to the last `<li>`.
 * @property  {string|string[]} [previousPageItem] CSS classes added to the previous `<li>`.
 * @property  {string|string[]} [nextPageItem] CSS classes added to the next `<li>`.
 * @property  {string|string[]} [pageItem] CSS classes added to page `<li>`.
 * @property  {string|string[]} [selectedItem] CSS classes added to the selected `<li>`.
 * @property  {string|string[]} [disabledItem] CSS classes added to the disabled `<li>`.
 * @property  {string|string[]} [link] CSS classes added to each link.
 */

/**
 * @typedef {Object} PaginationTemplates
 * @property  {string} [previous] Label for the Previous link.
 * @property  {string} [next] Label for the Next link.
 * @property  {string} [first] Label for the First link.
 * @property  {string} [last] Label for the Last link.
 */

/**
 * @typedef {Object} PaginationWidgetOptions
 * @property  {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property  {number} [totalPages] The max number of pages to browse.
 * @property  {number} [padding=3] The number of pages to display on each side of the current page.
 * @property  {string|HTMLElement|boolean} [scrollTo='body'] Where to scroll after a click, set to `false` to disable.
 * @property  {boolean} [showFirst=true] Whether to show the “first page” control
 * @property  {boolean} [showLast=true] Whether to show the last page” control
 * @property  {boolean} [showNext=true] Whether to show the “next page” control
 * @property  {boolean} [showPrevious=true] 	Whether to show the “previous page” control
 * @property  {PaginationTemplates} [templates] Text to display in the links.
 * @property  {PaginationCSSClasses} [cssClasses] CSS classes to be added.
 */

/**
 * The pagination widget allow the user to switch between pages of the results.
 *
 * This is an alternative to using the *show more* pattern, that allows the user
 * only to display more items. The *show more* pattern is usually preferred
 * because it is simpler to use, and it is more convenient in a mobile context.
 * See the infinite hits widget, for more information.
 *
 * When using the pagination with Algolia, you should be aware that the engine won't provide you pages
 * beyond the 1000th hits by default. You can find more information on the [Algolia documentation](https://www.algolia.com/doc/guides/searching/pagination/#pagination-limitations).
 *
 * @type {WidgetFactory}
 * @devNovel Pagination
 * @category navigation
 * @param {PaginationWidgetOptions} $0 Options for the Pagination widget.
 * @return {Widget} A new instance of Pagination widget.
 * @example
 * search.addWidgets([
 *   instantsearch.widgets.pagination({
 *     container: '#pagination-container',
 *     totalPages: 20,
 *     // default is to scroll to 'body', here we disable this behavior
 *     scrollTo: false,
 *     showFirst: false,
 *     showLast: false,
 *   })
 * ]);
 */
export default function pagination({
  container,
  templates: userTemplates = {},
  cssClasses: userCssClasses = {},
  totalPages,
  padding,
  showFirst = true,
  showLast = true,
  showPrevious = true,
  showNext = true,
  scrollTo: userScrollTo = 'body',
} = {}) {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const scrollTo = userScrollTo === true ? 'body' : userScrollTo;
  const scrollToNode = scrollTo !== false ? getContainerNode(scrollTo) : false;

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    noRefinementRoot: cx(
      suit({ modifierName: 'noRefinement' }),
      userCssClasses.noRefinementRoot
    ),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
    firstPageItem: cx(
      suit({ descendantName: 'item', modifierName: 'firstPage' }),
      userCssClasses.firstPageItem
    ),
    lastPageItem: cx(
      suit({ descendantName: 'item', modifierName: 'lastPage' }),
      userCssClasses.lastPageItem
    ),
    previousPageItem: cx(
      suit({ descendantName: 'item', modifierName: 'previousPage' }),
      userCssClasses.previousPageItem
    ),
    nextPageItem: cx(
      suit({ descendantName: 'item', modifierName: 'nextPage' }),
      userCssClasses.nextPageItem
    ),
    pageItem: cx(
      suit({ descendantName: 'item', modifierName: 'page' }),
      userCssClasses.pageItem
    ),
    selectedItem: cx(
      suit({ descendantName: 'item', modifierName: 'selected' }),
      userCssClasses.selectedItem
    ),
    disabledItem: cx(
      suit({ descendantName: 'item', modifierName: 'disabled' }),
      userCssClasses.disabledItem
    ),
    link: cx(suit({ descendantName: 'link' }), userCssClasses.link),
  };

  const templates = { ...defaultTemplates, ...userTemplates };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    templates,
    showFirst,
    showLast,
    showPrevious,
    showNext,
    padding,
    scrollToNode,
  });

  const makeWidget = connectPagination(specializedRenderer, () =>
    render(null, containerNode)
  );

  return makeWidget({ totalPages, padding });
}
