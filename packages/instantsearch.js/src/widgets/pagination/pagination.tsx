/** @jsx h */

import { connectPagination } from 'instantsearch-core';
import { createDocumentationMessageGenerator } from 'instantsearch-core/internal';
import { createPaginationComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import { prepareTemplateProps, renderTemplate } from '../../lib/templating';
import { getContainerNode } from '../../lib/utils';

import type { PreparedTemplateProps } from '../../lib/templating';
import type { Template } from '../../types';
import type {
  PaginationConnectorParams,
  PaginationRenderState,
  PaginationWidgetDescription,
} from 'instantsearch-core';
import type { Renderer, WidgetFactory } from 'instantsearch-core';
import type {
  PaginationClassNames,
  PaginationItemType,
  PaginationLinkTextComponentProps,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({ name: 'pagination' });

const Pagination = createPaginationComponent({
  createElement: h,
  Fragment,
});

const defaultTemplates: Required<PaginationTemplates> = {
  previous: () => '‹',
  next: () => '›',
  page: ({ page }) => `${page}`,
  first: () => '‹‹',
  last: () => '››',
};

const templateKeys: Record<PaginationItemType, keyof PaginationTemplates> = {
  firstPage: 'first',
  previousPage: 'previous',
  page: 'page',
  nextPage: 'next',
  lastPage: 'last',
};

const renderer = ({
  containerNode,
  classNames,
  templateProps,
  showFirst,
  showLast,
  showPrevious,
  showNext,
  scrollToNode,
}: {
  containerNode: HTMLElement;
  classNames: Partial<PaginationClassNames>;
  templateProps: PreparedTemplateProps<Required<PaginationTemplates>>;
  showFirst: boolean;
  showLast: boolean;
  showPrevious: boolean;
  showNext: boolean;
  scrollToNode: HTMLElement | false;
}): Renderer<PaginationRenderState, Partial<PaginationWidgetParams>> => {
  // Templates render the link content. A template resolving to `null` omits
  // the link, as it did when the `Template` owned the link element.
  const linkTextComponent = ({
    type,
    page,
  }: PaginationLinkTextComponentProps) => {
    const content = renderTemplate({
      templates: templateProps.templates,
      templateKey: templateKeys[type],
      data: { page: page + 1 },
    });

    if (content === null) {
      return null;
    }

    // An empty string renders an empty link rather than an empty text node
    return <Fragment>{content === '' ? null : content}</Fragment>;
  };

  return (
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

    const onNavigate = (page: number) => {
      refine(page);

      if (scrollToNode !== false) {
        scrollToNode.scrollIntoView();
      }
    };

    render(
      <Pagination
        createURL={createURL}
        classNames={classNames}
        currentPage={currentRefinement}
        nbPages={nbPages}
        pages={pages}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        onNavigate={onNavigate}
        showFirst={showFirst}
        showLast={showLast}
        showPrevious={showPrevious}
        showNext={showNext}
        linkTextComponent={linkTextComponent}
      />,
      containerNode
    );
  };
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

  const templateProps = prepareTemplateProps({
    defaultTemplates,
    templates: userTemplates,
  });

  const specializedRenderer = renderer({
    containerNode,
    classNames: userCssClasses,
    templateProps,
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
