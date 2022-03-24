import React from 'react';
import { usePagination } from 'react-instantsearch-hooks';

import { Pagination as PaginationUiComponent } from '../ui/Pagination';

import type { PaginationProps as PaginationUiComponentProps } from '../ui/Pagination';
import type { UsePaginationProps } from 'react-instantsearch-hooks';

export type PaginationProps = Omit<
  PaginationUiComponentProps,
  | 'pages'
  | 'currentPage'
  | 'isFirstPage'
  | 'isLastPage'
  | 'nbPages'
  | 'createURL'
  | 'onNavigate'
  | 'translations'
> &
  UsePaginationProps;

export function Pagination({
  showFirst,
  showPrevious,
  showNext,
  showLast,
  padding,
  totalPages,
  ...props
}: PaginationProps) {
  const {
    pages,
    currentRefinement,
    isFirstPage,
    isLastPage,
    nbPages,
    createURL,
    refine,
  } = usePagination(
    { padding, totalPages },
    {
      $$widgetType: 'ais.pagination',
    }
  );

  return (
    <PaginationUiComponent
      {...props}
      translations={{
        first: '‹‹',
        previous: '‹',
        next: '›',
        last: '››',
        page: (currentPage: number) => String(currentPage),
        ariaFirst: 'First',
        ariaPrevious: 'Previous',
        ariaNext: 'Next',
        ariaLast: 'Last',
        ariaPage: (currentPage: number) => `Page ${currentPage}`,
      }}
      showFirst={showFirst}
      showPrevious={showPrevious}
      showNext={showNext}
      showLast={showLast}
      isFirstPage={isFirstPage}
      isLastPage={isLastPage}
      currentPage={currentRefinement}
      nbPages={nbPages}
      createURL={createURL}
      onNavigate={refine}
      pages={pages}
    />
  );
}
