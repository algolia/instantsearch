/** @jsx createElement */
import { cx, isModifierClick } from '../lib';

import type { ComponentProps, Renderer } from '../types';

export type PaginationItemType =
  | 'firstPage'
  | 'previousPage'
  | 'page'
  | 'nextPage'
  | 'lastPage';

export type PageItemTextOptions = {
  /**
   * The page number to be displayed.
   */
  currentPage: number;
  /**
   * The total number of pages.
   */
  nbPages: number;
};

export type PaginationTranslations = {
  /**
   * The label for the first page's button.
   */
  firstPageItemText: string;
  /**
   * The label for the previous page's button.
   */
  previousPageItemText: string;
  /**
   * The label for the next page's button.
   */
  nextPageItemText: string;
  /**
   * The label for the last page's button.
   */
  lastPageItemText: string;
  /**
   * The label for a page's button.
   */
  pageItemText: (options: PageItemTextOptions) => string;
  /**
   * The accessible label for the first page's button.
   */
  firstPageItemAriaLabel: string;
  /**
   * The accessible label for the previous page's button.
   */
  previousPageItemAriaLabel: string;
  /**
   * The accessible label for the next page's button.
   */
  nextPageItemAriaLabel: string;
  /**
   * The accessible label for the last page's button.
   * @default `Last Page, Page ${nbPages}`
   */
  lastPageItemAriaLabel: string;
  /**
   * The accessible label for a page's button.
   */
  pageItemAriaLabel: (options: PageItemTextOptions) => string;
};

export type PaginationClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the root element when there are no refinements possible
   */
  noRefinementRoot: string | string[];
  /**
   * Class names to apply to the list element
   */
  list: string | string[];
  /**
   * Class names to apply to each item element
   */
  item: string | string[];
  /**
   * Class names to apply to the first page element
   */
  firstPageItem: string | string[];
  /**
   * Class names to apply to the previous page element
   */
  previousPageItem: string | string[];
  /**
   * Class names to apply to each page element
   */
  pageItem: string | string[];
  /**
   * Class names to apply to a selected page element
   */
  selectedItem: string | string[];
  /**
   * Class names to apply to a disabled page element
   */
  disabledItem: string | string[];
  /**
   * Class names to apply to the next page element
   */
  nextPageItem: string | string[];
  /**
   * Class names to apply to the last page element
   */
  lastPageItem: string | string[];
  /**
   * Class names to apply to each link element
   */
  link: string | string[];
};

export type PaginationLinkTextComponentProps = {
  type: PaginationItemType;
  /**
   * The zero-based page the item navigates to.
   */
  page: number;
};

export type PaginationItemComponentProps = {
  type: PaginationItemType;
  /**
   * The zero-based page the item navigates to.
   */
  page: number;
  isDisabled: boolean;
  isSelected: boolean;
  /**
   * The computed class names of the `<li>` root.
   */
  className: string;
  /**
   * The default item content (the link, or the `<span>` when disabled),
   * always provided. Render it to keep the default link inside a custom root.
   */
  children?: JSX.Element | null;
  key?: string | number;
};

export type PaginationProps = ComponentProps<'div'> & {
  pages: number[];
  /**
   * The zero-based current page.
   */
  currentPage: number;
  nbPages: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  showFirst?: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
  showLast?: boolean;
  createURL: (page: number) => string;
  /**
   * Called with the zero-based page when a link is clicked.
   */
  onNavigate: (page: number) => void;
  classNames?: Partial<PaginationClassNames>;
  translations?: Partial<PaginationTranslations>;
  /**
   * Overrides the content of each link.
   * Returning `null` omits the link element entirely.
   */
  linkTextComponent?: (
    props: PaginationLinkTextComponentProps
  ) => JSX.Element | string | null;
  /**
   * Overrides each item, including its `<li>` root.
   */
  itemComponent?: (props: PaginationItemComponentProps) => JSX.Element;
};

const defaultTranslations: Omit<
  PaginationTranslations,
  'lastPageItemAriaLabel'
> = {
  firstPageItemText: '‹‹',
  previousPageItemText: '‹',
  nextPageItemText: '›',
  lastPageItemText: '››',
  pageItemText: ({ currentPage }) => String(currentPage),
  firstPageItemAriaLabel: 'First Page',
  previousPageItemAriaLabel: 'Previous Page',
  nextPageItemAriaLabel: 'Next Page',
  pageItemAriaLabel: ({ currentPage }) => `Page ${currentPage}`,
};

export function createPaginationComponent({ createElement }: Renderer) {
  function DefaultItemComponent({
    type: _type,
    page: _page,
    isDisabled: _isDisabled,
    isSelected: _isSelected,
    children,
    ...rootProps
  }: PaginationItemComponentProps) {
    return <li {...rootProps}>{children}</li>;
  }

  return function Pagination(userProps: PaginationProps) {
    const {
      pages,
      currentPage,
      nbPages,
      isFirstPage,
      isLastPage,
      showFirst = true,
      showPrevious = true,
      showNext = true,
      showLast = true,
      createURL,
      onNavigate,
      classNames = {},
      translations: userTranslations,
      linkTextComponent,
      itemComponent: ItemComponent = DefaultItemComponent,
      ...props
    } = userProps;

    const translations: PaginationTranslations = {
      ...defaultTranslations,
      lastPageItemAriaLabel: `Last Page, Page ${nbPages}`,
      ...userTranslations,
    };

    const typeClassNames: Record<PaginationItemType, string> = {
      firstPage: cx('ais-Pagination-item--firstPage', classNames.firstPageItem),
      previousPage: cx(
        'ais-Pagination-item--previousPage',
        classNames.previousPageItem
      ),
      page: cx('ais-Pagination-item--page', classNames.pageItem),
      nextPage: cx('ais-Pagination-item--nextPage', classNames.nextPageItem),
      lastPage: cx('ais-Pagination-item--lastPage', classNames.lastPageItem),
    };

    function renderItem({
      type,
      page,
      isDisabled = false,
      isSelected = false,
      text,
      ariaLabel,
    }: {
      type: PaginationItemType;
      page: number;
      isDisabled?: boolean;
      isSelected?: boolean;
      text: string;
      ariaLabel: string;
    }) {
      const content = linkTextComponent
        ? linkTextComponent({ type, page })
        : text;
      const linkClassName = cx('ais-Pagination-link', classNames.link);

      let link: JSX.Element | null = null;
      if (content !== null && isDisabled) {
        link = (
          <span className={linkClassName} aria-label={ariaLabel}>
            {content}
          </span>
        );
      } else if (content !== null) {
        link = (
          <a
            className={linkClassName}
            aria-label={ariaLabel}
            aria-current={isSelected ? 'page' : undefined}
            href={createURL(page)}
            onClick={(event) => {
              if (isModifierClick(event)) {
                return;
              }

              event.preventDefault();
              onNavigate(page);
            }}
          >
            {content}
          </a>
        );
      }

      return (
        <ItemComponent
          key={type === 'page' ? page : type}
          type={type}
          page={page}
          isDisabled={isDisabled}
          isSelected={isSelected}
          className={cx(
            'ais-Pagination-item',
            classNames.item,
            isDisabled &&
              cx('ais-Pagination-item--disabled', classNames.disabledItem),
            typeClassNames[type],
            isSelected &&
              cx('ais-Pagination-item--selected', classNames.selectedItem)
          )}
        >
          {link}
        </ItemComponent>
      );
    }

    return (
      <div
        {...props}
        className={cx(
          'ais-Pagination',
          classNames.root,
          nbPages <= 1 &&
            cx('ais-Pagination--noRefinement', classNames.noRefinementRoot),
          props.className
        )}
      >
        <ul className={cx('ais-Pagination-list', classNames.list)}>
          {showFirst &&
            renderItem({
              type: 'firstPage',
              page: 0,
              isDisabled: isFirstPage,
              text: translations.firstPageItemText,
              ariaLabel: translations.firstPageItemAriaLabel,
            })}
          {showPrevious &&
            renderItem({
              type: 'previousPage',
              page: currentPage - 1,
              isDisabled: isFirstPage,
              text: translations.previousPageItemText,
              ariaLabel: translations.previousPageItemAriaLabel,
            })}
          {pages.map((page) =>
            renderItem({
              type: 'page',
              page,
              isSelected: page === currentPage,
              text: translations.pageItemText({
                currentPage: page + 1,
                nbPages,
              }),
              ariaLabel: translations.pageItemAriaLabel({
                currentPage: page + 1,
                nbPages,
              }),
            })
          )}
          {showNext &&
            renderItem({
              type: 'nextPage',
              page: currentPage + 1,
              isDisabled: isLastPage,
              text: translations.nextPageItemText,
              ariaLabel: translations.nextPageItemAriaLabel,
            })}
          {showLast &&
            renderItem({
              type: 'lastPage',
              page: nbPages - 1,
              isDisabled: isLastPage,
              text: translations.lastPageItemText,
              ariaLabel: translations.lastPageItemAriaLabel,
            })}
        </ul>
      </div>
    );
  };
}
