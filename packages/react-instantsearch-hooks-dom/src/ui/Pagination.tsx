import React from 'react';

import { cx } from './lib/cx';
import { isModifierClick } from './lib/isModifierClick';

import type { CreateURL } from 'instantsearch.js';

export type PaginationTranslations = {
  /**
   * The label for the first page's button.
   */
  first: string;
  /**
   * The label for the previous page's button.
   */
  previous: string;
  /**
   * The label for the next page's button.
   */
  next: string;
  /**
   * The label for the last page's button.
   */
  last: string;
  /**
   * The label for a page's button.
   */
  page(currentPage: number): string;
  /**
   * The accessible label for the first page's button.
   */
  ariaFirst: string;
  /**
   * The accessible label for the previous page's button.
   */
  ariaPrevious: string;
  /**
   * The accessible label for the next page's button.
   */
  ariaNext: string;
  /**
   * The accessible label for the last page's button.
   */
  ariaLast: string;
  /**
   * The accessible label for a page's button.
   */
  ariaPage(currentPage: number): string;
};

export type PaginationProps = React.HTMLAttributes<HTMLDivElement> & {
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
            aria-label={translations.ariaFirst}
            href={createURL(firstPageIndex)}
            onClick={() => onNavigate(firstPageIndex)}
          >
            {translations.first}
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
            aria-label={translations.ariaPrevious}
            href={createURL(previousPageIndex)}
            onClick={() => onNavigate(previousPageIndex)}
          >
            {translations.previous}
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
              aria-label={translations.ariaPage(page + 1)}
              href={createURL(page)}
              onClick={() => onNavigate(page)}
            >
              {translations.page(page + 1)}
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
            aria-label={translations.ariaNext}
            href={createURL(nextPageIndex)}
            onClick={() => onNavigate(nextPageIndex)}
          >
            {translations.next}
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
            aria-label={translations.ariaLast}
            href={createURL(lastPageIndex)}
            onClick={() => onNavigate(lastPageIndex)}
          >
            {translations.last}
          </PaginationItem>
        )}
      </ul>
    </div>
  );
}

type PaginationItemProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'onClick'
> & {
  onClick: NonNullable<
    React.AnchorHTMLAttributes<HTMLAnchorElement>['onClick']
  >;
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
