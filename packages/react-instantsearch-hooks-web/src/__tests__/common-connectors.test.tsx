/**
 * @jest-environment jsdom
 */
import { runTestSuites } from '@instantsearch/tests';
import * as suites from '@instantsearch/tests/connectors';
import { act, render } from '@testing-library/react';
import { connectRatingMenu } from 'instantsearch.js/es/connectors';
import React from 'react';

import {
  InstantSearch,
  RefinementList,
  useRefinementList,
  usePagination,
  useBreadcrumb,
  useHierarchicalMenu,
  useHitsPerPage,
  useMenu,
  useNumericMenu,
  useConnector,
  useToggleRefinement,
  useCurrentRefinements,
} from '..';

import type {
  UseBreadcrumbProps,
  UseCurrentRefinementsProps,
  UseHierarchicalMenuProps,
  UseHitsPerPageProps,
  UseMenuProps,
  UseNumericMenuProps,
  UsePaginationProps,
  UseRefinementListProps,
  UseToggleRefinementProps,
} from '..';
import type { TestOptionsMap, TestSetupsMap } from '@instantsearch/tests';
import type {
  RatingMenuConnectorParams,
  RatingMenuWidgetDescription,
} from 'instantsearch.js/es/connectors/rating-menu/connectRatingMenu';

type TestSuites = typeof suites;
const testSuites: TestSuites = suites;

const testSetups: TestSetupsMap<TestSuites> = {
  createRefinementListConnectorTests({ instantSearchOptions, widgetParams }) {
    function CustomRefinementList(props: UseRefinementListProps) {
      const { createURL, refine } = useRefinementList(props);
      return (
        <>
          <a data-testid="RefinementList-link" href={createURL('value')}>
            LINK
          </a>
          <button
            data-testid="RefinementList-refine"
            onClick={() => refine('Apple')}
          >
            BUTTON
          </button>
        </>
      );
    }
    render(
      <InstantSearch {...instantSearchOptions}>
        <CustomRefinementList {...widgetParams} />
      </InstantSearch>
    );
  },

  createHierarchicalMenuConnectorTests({ instantSearchOptions, widgetParams }) {
    function CustomHierarchicalMenu(props: UseHierarchicalMenuProps) {
      const { createURL, refine } = useHierarchicalMenu(props);
      return (
        <>
          <a data-testid="HierarchicalMenu-link" href={createURL('value')}>
            LINK
          </a>
          <button
            data-testid="HierarchicalMenu-refine"
            onClick={() => refine('Apple')}
          >
            BUTTON
          </button>
        </>
      );
    }

    render(
      <InstantSearch {...instantSearchOptions}>
        <CustomHierarchicalMenu {...widgetParams} />
      </InstantSearch>
    );
  },

  createBreadcrumbConnectorTests({ instantSearchOptions, widgetParams }) {
    function CustomBreadcrumb(props: UseBreadcrumbProps) {
      const { createURL, refine } = useBreadcrumb(props);
      return (
        <>
          <a data-testid="Breadcrumb-link" href={createURL('Apple > iPhone')}>
            LINK
          </a>
          <button
            data-testid="Breadcrumb-refine"
            onClick={() => refine('Apple')}
          >
            BUTTON
          </button>
        </>
      );
    }
    render(
      <InstantSearch {...instantSearchOptions}>
        <CustomBreadcrumb {...widgetParams} />
      </InstantSearch>
    );
  },

  createMenuConnectorTests({ instantSearchOptions, widgetParams }) {
    function CustomMenu(props: UseMenuProps) {
      const { createURL, refine } = useMenu(props);
      return (
        <>
          <a data-testid="Menu-link" href={createURL('value')}>
            LINK
          </a>
          <button data-testid="Menu-refine" onClick={() => refine('Apple')}>
            BUTTON
          </button>
        </>
      );
    }

    render(
      <InstantSearch {...instantSearchOptions}>
        <CustomMenu {...widgetParams} />
      </InstantSearch>
    );
  },

  createPaginationConnectorTests({ instantSearchOptions, widgetParams }) {
    function CustomPagination(props: UsePaginationProps) {
      const { createURL, refine } = usePagination(props);
      return (
        <>
          <a data-testid="Pagination-link" href={createURL(10)}>
            LINK
          </a>
          <button data-testid="Pagination-refine" onClick={() => refine(10)}>
            BUTTON
          </button>
        </>
      );
    }
    render(
      <InstantSearch {...instantSearchOptions}>
        <CustomPagination {...widgetParams} />
      </InstantSearch>
    );
  },

  createCurrentRefinementsConnectorTests({
    instantSearchOptions,
    widgetParams,
  }) {
    function CustomCurrentRefinements(props: UseCurrentRefinementsProps) {
      const { createURL, refine } = useCurrentRefinements(props);
      return (
        <>
          <a
            data-testid="CurrentRefinements-link"
            href={createURL({
              attribute: 'brand',
              type: 'disjunctive',
              value: 'Apple',
              label: 'Apple',
            })}
          >
            LINK
          </a>
          <button
            data-testid="Breadcrumb-refine"
            onClick={() =>
              refine({
                attribute: 'brand',
                type: 'disjunctive',
                value: 'Samsung',
                label: 'Samsung',
              })
            }
          >
            BUTTON
          </button>
        </>
      );
    }

    render(
      <InstantSearch {...instantSearchOptions}>
        <CustomCurrentRefinements {...widgetParams} />
        <RefinementList attribute="brand" />
      </InstantSearch>
    );
  },
  createHitsPerPageConnectorTests({ instantSearchOptions, widgetParams }) {
    function CustomHitsPerPage(props: UseHitsPerPageProps) {
      const { createURL, refine } = useHitsPerPage(props);
      return (
        <>
          <a data-testid="HitsPerPage-link" href={createURL(12)}>
            LINK
          </a>
          <button data-testid="HitsPerPage-refine" onClick={() => refine(5)}>
            BUTTON
          </button>
        </>
      );
    }

    render(
      <InstantSearch {...instantSearchOptions}>
        <CustomHitsPerPage {...widgetParams} />
      </InstantSearch>
    );
  },

  createNumericMenuConnectorTests({ instantSearchOptions, widgetParams }) {
    function CustomNumericMenu(props: UseNumericMenuProps) {
      const { createURL, refine } = useNumericMenu(props);
      return (
        <>
          <a
            data-testid="NumericMenu-link"
            href={createURL(encodeURI('{ "start": 500 }'))}
          >
            LINK
          </a>
          <button
            data-testid="NumericMenu-refine"
            onClick={() => refine('500')}
          >
            BUTTON
          </button>
        </>
      );
    }

    render(
      <InstantSearch {...instantSearchOptions}>
        <CustomNumericMenu {...widgetParams} />
      </InstantSearch>
    );
  },

  createRatingMenuConnectorTests({ instantSearchOptions, widgetParams }) {
    function CustomRatingMenu(props: RatingMenuConnectorParams) {
      const { createURL, refine } = useConnector<
        RatingMenuConnectorParams,
        RatingMenuWidgetDescription
      >(connectRatingMenu, props);
      return (
        <>
          <a data-testid="RatingMenu-link" href={createURL(encodeURI('5'))}>
            LINK
          </a>
          <button data-testid="RatingMenu-refine" onClick={() => refine('5')}>
            BUTTON
          </button>
        </>
      );
    }

    render(
      <InstantSearch {...instantSearchOptions}>
        <CustomRatingMenu {...widgetParams} />
      </InstantSearch>
    );
  },

  createToggleRefinementConnectorTests({ instantSearchOptions, widgetParams }) {
    function CustomToggleRefinement(props: UseToggleRefinementProps) {
      const { createURL, refine, value } = useToggleRefinement(props);
      return (
        <>
          <a data-testid="ToggleRefinement-link" href={createURL()}>
            LINK
          </a>
          <button
            data-testid="ToggleRefinement-refine"
            onClick={() => refine(value)}
          >
            BUTTON
          </button>
        </>
      );
    }

    render(
      <InstantSearch {...instantSearchOptions}>
        <CustomToggleRefinement {...widgetParams} />
      </InstantSearch>
    );
  },
};

const testOptions: TestOptionsMap<TestSuites> = {
  createCurrentRefinementsConnectorTests: {
    act,
    skippedTests: {
      /** createURL uses helper state instead of ui state as it can't be translated */
      routing: true,
    },
  },
  createHierarchicalMenuConnectorTests: { act },
  createBreadcrumbConnectorTests: { act },
  createMenuConnectorTests: { act },
  createPaginationConnectorTests: { act },
  createRefinementListConnectorTests: { act },
  createHitsPerPageConnectorTests: { act },
  createNumericMenuConnectorTests: { act },
  createRatingMenuConnectorTests: { act },
  createToggleRefinementConnectorTests: { act },
};

describe('Common connector tests (React InstantSearch)', () => {
  runTestSuites({
    testSuites,
    testSetups,
    testOptions,
  });
});
