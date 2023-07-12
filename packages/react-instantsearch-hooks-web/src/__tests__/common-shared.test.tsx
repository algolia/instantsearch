/**
 * @jest-environment jsdom
 */
import { createSharedTests } from '@instantsearch/tests';
import { act, render } from '@testing-library/react';
import React from 'react';

import {
  InstantSearch,
  Menu,
  Pagination,
  Hits,
  usePagination,
  useMenu,
} from '..';

import type { UseMenuProps, UsePaginationProps } from '..';

createSharedTests(({ instantSearchOptions, widgetParams }) => {
  function MenuURL(props: UseMenuProps) {
    const { createURL } = useMenu(props);
    return (
      <a data-testid="Menu-link" href={createURL('value')}>
        LINK
      </a>
    );
  }

  function PaginationURL(props: UsePaginationProps) {
    const { createURL } = usePagination(props);
    return (
      <a data-testid="Pagination-link" href={createURL(10)}>
        LINK
      </a>
    );
  }

  render(
    <InstantSearch {...instantSearchOptions}>
      <MenuURL {...widgetParams.menu} />
      <Menu {...widgetParams.menu} />
      <Hits {...widgetParams.hits} />
      <PaginationURL {...widgetParams.pagination} />
      <Pagination {...widgetParams.pagination} />
    </InstantSearch>
  );
}, act);
