/**
 * @jest-environment jsdom
 */
import { runTestSuites } from '@instantsearch/tests';
import * as suites from '@instantsearch/tests/shared';
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
import type { TestOptionsMap, TestSetupsMap } from '@instantsearch/tests';

type TestSuites = typeof suites;
const testSuites: TestSuites = suites;

const testSetups: TestSetupsMap<TestSuites> = {
  createSharedTests({ instantSearchOptions, widgetParams }) {
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
  },
};

const testOptions: TestOptionsMap<TestSuites> = {
  createSharedTests: { act },
};

describe('Common shared tests (React InstantSearch)', () => {
  runTestSuites({
    testSuites,
    testSetups,
    testOptions,
  });
});
