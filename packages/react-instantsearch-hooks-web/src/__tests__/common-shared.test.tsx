/**
 * @jest-environment jsdom
 */
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

type TestSuites = typeof suites;
const testSuites: TestSuites = suites;
type TestSetups = {
  [key in keyof TestSuites]: Parameters<TestSuites[key]>[0];
};

const setups: TestSetups = {
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

describe('Common shared tests (React InstantSearch)', () => {
  test('has all the tests', () => {
    expect(Object.keys(setups).sort()).toEqual(Object.keys(testSuites).sort());
  });

  Object.keys(testSuites).forEach((testName) => {
    // @ts-ignore (typescript is only referentially typed)
    // https://github.com/microsoft/TypeScript/issues/38520
    testSuites[testName](setups[testName], act);
  });
});
