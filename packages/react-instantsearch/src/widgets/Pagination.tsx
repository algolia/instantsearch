import React from 'react';
import { usePagination } from 'react-instantsearch-core';

import { Pagination as PaginationUiComponent } from '../ui/Pagination';

import type { PaginationProps as PaginationUiComponentProps } from '../ui/Pagination';
import type { UsePaginationProps } from 'react-instantsearch-core';

type UiProps = Pick<
  PaginationUiComponentProps,
  | 'pages'
  | 'currentPage'
  | 'isFirstPage'
  | 'isLastPage'
  | 'nbPages'
  | 'createURL'
  | 'onNavigate'
  | 'translations'
>;

export type PaginationProps = Omit<PaginationUiComponentProps, keyof UiProps> &
  UsePaginationProps & { translations?: Partial<UiProps['translations']> };

export function Pagination({
  showFirst,
  showPrevious,
  showNext,
  showLast,
  padding,
  totalPages,
  translations,
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

  const uiProps: UiProps = {
    pages,
    currentPage: currentRefinement,
    isFirstPage,
    isLastPage,
    nbPages,
    createURL,
    onNavigate: refine,
    translations: {
      firstPageItemText: '‹‹',
      previousPageItemText: '‹',
      nextPageItemText: '›',
      lastPageItemText: '››',
      pageItemText: ({ currentPage }) => String(currentPage),
      firstPageItemAriaLabel: 'First Page',
      previousPageItemAriaLabel: 'Previous Page',
      nextPageItemAriaLabel: 'Next Page',
      lastPageItemAriaLabel: `Last Page, Page ${nbPages}`,
      pageItemAriaLabel: ({ currentPage }) => `Page ${currentPage}`,
      ...translations,
    },
  };

  return (
    <PaginationUiComponent
      {...props}
      {...uiProps}
      showFirst={showFirst}
      showPrevious={showPrevious}
      showNext={showNext}
      showLast={showLast}
    />
  );
}
