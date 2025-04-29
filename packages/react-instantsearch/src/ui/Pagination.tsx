import { cx } from 'instantsearch-ui-components';
import React from 'react';

import { isModifierClick } from './lib/isModifierClick';

import type { CreateURL } from 'instantsearch.js';

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
   */
  lastPageItemAriaLabel: string;
  /**
   * The accessible label for a page's button.
   */
  pageItemAriaLabel: (options: PageItemTextOptions) => string;
};

export type PaginationProps = React.ComponentProps<'div'> & {
  classNames?: Partial<PaginationClassNames>;
  pages: number[];
  currentPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  nbPages: number;
  showFirst?: boolean;
  showPrevious?: boolean;
  showNext?: boolean;
  showLast?: boolean;
  createURL: CreateURL<number>;
  onNavigate: (page: number) => void;
} & { translations: PaginationTranslations };

export type PaginationClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
  /**
   * Class names to apply to the root element when there are no refinements possible
   */
  noRefinementRoot: string;
  /**
   * Class names to apply to the list element
   */
  list: string;
  /**
   * Class names to apply to each item element
   */
  item: string;
  /**
   * Class names to apply to the first page element
   */
  firstPageItem: string;
  /**
   * Class names to apply to the previous page element
   */
  previousPageItem: string;
  /**
   * Class names to apply to each page element
   */
  pageItem: string;
  /**
   * Class names to apply to a selected page element
   */
  selectedItem: string;
  /**
   * Class names to apply to a disabled page element
   */
  disabledItem: string;
  /**
   * Class names to apply to the next page element
   */
  nextPageItem: string;
  /**
   * Class names to apply to the last page element
   */
  lastPageItem: string;
  /**
   * Class names to apply to each link element
   */
  link: string;
};

export function Pagination({
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
  translations,
  classNames = {},
  ...props
}: PaginationProps) {
  const firstPageIndex = 0;
  const previousPageIndex = currentPage - 1;
  const nextPageIndex = currentPage + 1;
  const lastPageIndex = nbPages - 1;

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
        {showFirst && (
          <PaginationItem
            isDisabled={isFirstPage}
            className={cx(
              'ais-Pagination-item--firstPage',
              classNames.firstPageItem
            )}
            classNames={classNames}
            aria-label={translations.firstPageItemAriaLabel}
            href={createURL(firstPageIndex)}
            onClick={() => onNavigate(firstPageIndex)}
          >
            {translations.firstPageItemText}
          </PaginationItem>
        )}
        {showPrevious && (
          <PaginationItem
            isDisabled={isFirstPage}
            className={cx(
              'ais-Pagination-item--previousPage',
              classNames.previousPageItem
            )}
            classNames={classNames}
            aria-label={translations.previousPageItemAriaLabel}
            href={createURL(previousPageIndex)}
            onClick={() => onNavigate(previousPageIndex)}
          >
            {translations.previousPageItemText}
          </PaginationItem>
        )}
        {pages.map((page) => {
          return (
            <PaginationItem
              key={page}
              isDisabled={false}
              className={cx(
                'ais-Pagination-item--page',
                classNames.pageItem,
                page === currentPage &&
                  cx('ais-Pagination-item--selected', classNames.selectedItem)
              )}
              classNames={classNames}
              aria-label={translations.pageItemAriaLabel({
                currentPage: page + 1,
                nbPages,
              })}
              href={createURL(page)}
              onClick={() => onNavigate(page)}
            >
              {translations.pageItemText({ currentPage: page + 1, nbPages })}
            </PaginationItem>
          );
        })}
        {showNext && (
          <PaginationItem
            isDisabled={isLastPage}
            className={cx(
              'ais-Pagination-item--nextPage',
              classNames.nextPageItem
            )}
            classNames={classNames}
            aria-label={translations.nextPageItemAriaLabel}
            href={createURL(nextPageIndex)}
            onClick={() => onNavigate(nextPageIndex)}
          >
            {translations.nextPageItemText}
          </PaginationItem>
        )}
        {showLast && (
          <PaginationItem
            isDisabled={isLastPage}
            className={cx(
              'ais-Pagination-item--lastPage',
              classNames.lastPageItem
            )}
            classNames={classNames}
            aria-label={translations.lastPageItemAriaLabel}
            href={createURL(lastPageIndex)}
            onClick={() => onNavigate(lastPageIndex)}
          >
            {translations.lastPageItemText}
          </PaginationItem>
        )}
      </ul>
    </div>
  );
}

type PaginationItemProps = Omit<React.ComponentProps<'a'>, 'onClick'> & {
  onClick: NonNullable<React.ComponentProps<'a'>['onClick']>;
  isDisabled: boolean;
  classNames: Partial<PaginationClassNames>;
};

function PaginationItem({
  isDisabled,
  className,
  classNames,
  href,
  onClick,
  ...props
}: PaginationItemProps) {
  if (isDisabled) {
    return (
      <li
        className={cx(
          'ais-Pagination-item',
          classNames.item,
          'ais-Pagination-item--disabled',
          classNames.disabledItem,
          className
        )}
      >
        <span
          className={cx('ais-Pagination-link', classNames.link)}
          {...props}
        />
      </li>
    );
  }

  return (
    <li className={cx('ais-Pagination-item', classNames.item, className)}>
      <a
        className={cx('ais-Pagination-link', classNames.link)}
        href={href}
        onClick={(event) => {
          if (isModifierClick(event)) {
            return;
          }

          event.preventDefault();

          onClick(event);
        }}
        {...props}
      />
    </li>
  );
}
