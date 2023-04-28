/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
import { h, render } from 'preact';

import Pagination from '../../components/Pagination/Pagination';
import connectPagination from '../../connectors/pagination/connectPagination';
import { component } from '../../lib/suit';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  PaginationComponentCSSClasses,
  PaginationComponentTemplates,
} from '../../components/Pagination/Pagination';
import type {
  PaginationConnectorParams,
  PaginationRenderState,
  PaginationWidgetDescription,
} from '../../connectors/pagination/connectPagination';
import type { Renderer, Template, WidgetFactory } from '../../types';

const suit = component('Pagination');
const withUsage = createDocumentationMessageGenerator({ name: 'pagination' });

const defaultTemplates: PaginationComponentTemplates = {
  previous: () => '‹',
  next: () => '›',
  page: ({ page }) => `${page}`,
  first: () => '«',
  last: () => '»',
};

const renderer =
  ({
    containerNode,
    cssClasses,
    templates,
    showFirst,
    showLast,
    showPrevious,
    showNext,
    scrollToNode,
  }: {
    containerNode: HTMLElement;
    cssClasses: PaginationComponentCSSClasses;
    templates: PaginationComponentTemplates;
    showFirst: boolean;
    showLast: boolean;
    showPrevious: boolean;
    showNext: boolean;
    scrollToNode: HTMLElement | false;
  }): Renderer<PaginationRenderState, Partial<PaginationWidgetParams>> =>
  (
    {
      createURL,
      currentRefinement,
      nbPages,
      pages,
      isFirstPage,
      isLastPage,
      refine,
    },
    isFirstRendering
  ) => {
    if (isFirstRendering) return;

    const setCurrentPage = (pageNumber: number) => {
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
        nbPages={nbPages}
        pages={pages}
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

export type PaginationCSSClasses = Partial<{
  /**
   * CSS classes added to the root element of the widget.
   */
  root: string | string[];

  /**
   * CSS class to add to the root element of the widget if there are no refinements.
   */
  noRefinementRoot: string | string[];

  /**
   * CSS classes added to the wrapping `<ul>`.
   */
  list: string | string[];

  /**
   * CSS classes added to each `<li>`.
   */
  item: string | string[];

  /**
   * CSS classes added to the first `<li>`.
   */
  firstPageItem: string | string[];

  /**
   * CSS classes added to the last `<li>`.
   */
  lastPageItem: string | string[];

  /**
   * CSS classes added to the previous `<li>`.
   */
  previousPageItem: string | string[];

  /**
   * CSS classes added to the next `<li>`.
   */
  nextPageItem: string | string[];

  /**
   * CSS classes added to page `<li>`.
   */
  pageItem: string | string[];

  /**
   * CSS classes added to the selected `<li>`.
   */
  selectedItem: string | string[];

  /**
   * CSS classes added to the disabled `<li>`.
   */
  disabledItem: string | string[];

  /**
   * CSS classes added to each link.
   */
  link: string | string[];
}>;

export type PaginationTemplates = Partial<{
  /**
   * Label for the Previous link.
   */
  previous: Template;

  /**
   * Label for the Next link.
   */
  next: Template;

  /**
   * Label for the link of a certain page
   * Page is one-based, so `page` will be `1` for the first page.
   */
  page: Template<{ page: number }>;

  /**
   * Label for the First link.
   */
  first: Template;

  /**
   * Label for the Last link.
   */
  last: Template;
}>;

export type PaginationWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * The max number of pages to browse.
   */
  totalPages?: number;

  /**
   * The number of pages to display on each side of the current page.
   * @default 3
   */
  padding?: number;

  /**
   * Where to scroll after a click, set to `false` to disable.
   * @default body
   */
  scrollTo?: string | HTMLElement | boolean;

  /**
   * Whether to show the "first page" control
   * @default true
   */
  showFirst?: boolean;

  /**
   * Whether to show the "last page" control
   * @default true
   */
  showLast?: boolean;

  /**
   * Whether to show the "next page" control
   * @default true
   */
  showNext?: boolean;

  /**
   * Whether to show the "previous page" control
   * @default true
   */
  showPrevious?: boolean;

  /**
   * Text to display in the links.
   */
  templates?: PaginationTemplates;

  /**
   * CSS classes to be added.
   */
  cssClasses?: PaginationCSSClasses;
};

export type PaginationWidget = WidgetFactory<
  PaginationWidgetDescription & { $$widgetType: 'ais.pagination' },
  PaginationConnectorParams,
  PaginationWidgetParams
>;

const pagination: PaginationWidget = function pagination(widgetParams) {
  const {
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
  } = widgetParams || {};

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

  const templates = {
    ...defaultTemplates,
    ...userTemplates,
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    templates,
    showFirst,
    showLast,
    showPrevious,
    showNext,
    scrollToNode,
  });

  const makeWidget = connectPagination(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({ totalPages, padding }),
    $$widgetType: 'ais.pagination',
  };
};

export default pagination;
