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
  UsePaginationProps & { translations?: UiProps['translations'] };

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
    translations,
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
