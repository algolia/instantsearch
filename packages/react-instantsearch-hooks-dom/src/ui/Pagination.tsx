import React from 'react';

import { cx } from './lib/cx';
import { isModifierClick } from './lib/isModifierClick';

import type { CreateURL } from 'instantsearch.js';

export type PaginationProps = React.HTMLAttributes<HTMLDivElement> & {
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
        nbPages <= 1 && 'ais-Pagination--noRefinement',
        props.className
      )}
    >
      <ul className="ais-Pagination-list">
        {showFirst && (
          <PaginationItem
            isDisabled={isFirstPage}
            className="ais-Pagination-item--firstPage"
            aria-label="First"
            href={createURL(firstPageIndex)}
            onClick={() => onNavigate(firstPageIndex)}
          >
            ‹‹
          </PaginationItem>
        )}
        {showPrevious && (
          <PaginationItem
            isDisabled={isFirstPage}
            className="ais-Pagination-item--previousPage"
            aria-label="Previous"
            href={createURL(previousPageIndex)}
            onClick={() => onNavigate(previousPageIndex)}
          >
            ‹
          </PaginationItem>
        )}
        {pages.map((page) => {
          const label = String(page + 1);

          return (
            <PaginationItem
              key={page}
              isDisabled={false}
              className={cx(
                'ais-Pagination-item--page',
                page === currentPage && 'ais-Pagination-item--selected'
              )}
              aria-label={label}
              href={createURL(page)}
              onClick={() => onNavigate(page)}
            >
              {label}
            </PaginationItem>
          );
        })}
        {showNext && (
          <PaginationItem
            isDisabled={isLastPage}
            className="ais-Pagination-item--nextPage"
            aria-label="Next"
            href={createURL(nextPageIndex)}
            onClick={() => onNavigate(nextPageIndex)}
          >
            ›
          </PaginationItem>
        )}
        {showLast && (
          <PaginationItem
            isDisabled={isLastPage}
            className="ais-Pagination-item--lastPage"
            aria-label="Last"
            href={createURL(lastPageIndex)}
            onClick={() => onNavigate(lastPageIndex)}
          >
            ››
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
} & {
  isDisabled: boolean;
};

function PaginationItem({
  isDisabled,
  className,
  href,
  onClick,
  ...props
}: PaginationItemProps) {
  if (isDisabled) {
    return (
      <li
        className={cx(
          'ais-Pagination-item ais-Pagination-item--disabled',
          className
        )}
      >
        <span className="ais-Pagination-link" {...props} />
      </li>
    );
  }

  return (
    <li className={cx('ais-Pagination-item', className)}>
      <a
        className="ais-Pagination-link"
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
