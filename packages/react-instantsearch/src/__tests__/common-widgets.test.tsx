/**
 * @jest-environment jsdom
 */
import { runTestSuites } from '@instantsearch/tests';
import * as suites from '@instantsearch/tests/widgets';
import { act, render } from '@testing-library/react';
import React from 'react';

import {
  InstantSearch,
  RefinementList,
  HierarchicalMenu,
  Breadcrumb,
  Menu,
  Pagination,
  InfiniteHits,
  SearchBox,
  useInstantSearch,
  Hits,
  Index,
  RangeInput,
  HitsPerPage,
  ClearRefinements,
  CurrentRefinements,
  ToggleRefinement,
  SortBy,
} from '..';

import type { TestOptionsMap, TestSetupsMap } from '@instantsearch/tests';
import type { Hit } from 'instantsearch.js';
import type { SendEventForHits } from 'instantsearch.js/es/lib/utils';

type TestSuites = typeof suites;
const testSuites: TestSuites = suites;

const testSetups: TestSetupsMap<TestSuites> = {
  createRefinementListWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <RefinementList {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createHierarchicalMenuWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <HierarchicalMenu {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createBreadcrumbWidgetTests({ instantSearchOptions, widgetParams }) {
    const { transformItems, ...hierarchicalWidgetParams } = widgetParams;

    render(
      <InstantSearch {...instantSearchOptions}>
        <Breadcrumb {...widgetParams} />
        <HierarchicalMenu {...hierarchicalWidgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createMenuWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <Menu {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createPaginationWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <Pagination {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createInfiniteHitsWidgetTests({ instantSearchOptions, widgetParams }) {
    function MainHit({
      hit,
      sendEvent,
    }: {
      hit: Hit;
      sendEvent: SendEventForHits;
    }) {
      return (
        <div data-testid={`main-hits-top-level-${hit.__position}`}>
          {hit.objectID}
          <button
            data-testid={`main-hits-convert-${hit.__position}`}
            onClick={() => sendEvent('conversion', hit, 'Converted')}
          >
            convert
          </button>
          <button
            data-testid={`main-hits-click-${hit.__position}`}
            onClick={() => sendEvent('click', hit, 'Clicked')}
          >
            click
          </button>
        </div>
      );
    }

    function NestedHit({
      hit,
      sendEvent,
    }: {
      hit: Hit;
      sendEvent: SendEventForHits;
    }) {
      return (
        <div data-testid={`nested-hits-${hit.__position}`}>
          {hit.objectID}
          <button
            data-testid={`nested-hits-click-${hit.__position}`}
            onClick={() => sendEvent('click', hit, 'Clicked nested')}
          >
            click
          </button>
        </div>
      );
    }

    render(
      <InstantSearch {...instantSearchOptions}>
        <SearchBox />
        <InfiniteHits id="main-hits" hitComponent={MainHit} {...widgetParams} />
        <Index indexName="nested">
          <InfiniteHits id="nested-hits" hitComponent={NestedHit} />
        </Index>
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createHitsWidgetTests({ instantSearchOptions, widgetParams }) {
    function MainHit({
      hit,
      sendEvent,
    }: {
      hit: Hit;
      sendEvent: SendEventForHits;
    }) {
      return (
        <div data-testid={`main-hits-top-level-${hit.__position}`}>
          {hit.objectID}
          <button
            data-testid={`main-hits-convert-${hit.__position}`}
            onClick={() => sendEvent('conversion', hit, 'Converted')}
          >
            convert
          </button>
          <button
            data-testid={`main-hits-click-${hit.__position}`}
            onClick={() => sendEvent('click', hit, 'Clicked')}
          >
            click
          </button>
        </div>
      );
    }

    function NestedHit({
      hit,
      sendEvent,
    }: {
      hit: Hit;
      sendEvent: SendEventForHits;
    }) {
      return (
        <div data-testid={`nested-hits-${hit.__position}`}>
          {hit.objectID}
          <button
            data-testid={`nested-hits-click-${hit.__position}`}
            onClick={() => sendEvent('click', hit, 'Clicked nested')}
          >
            click
          </button>
        </div>
      );
    }

    render(
      <InstantSearch {...instantSearchOptions}>
        <SearchBox />
        <Hits id="main-hits" hitComponent={MainHit} {...widgetParams} />
        <div id="hits-with-defaults">
          <Hits {...widgetParams} />
        </div>
        <Index indexName="nested">
          <Hits id="nested-hits" hitComponent={NestedHit} />
        </Index>
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createRangeInputWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <RangeInput {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createInstantSearchWidgetTests({ instantSearchOptions }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <GlobalErrorSwallower />
      </InstantSearch>
    );

    return {
      algoliaAgents: [
        `instantsearch.js (${
          require('../../../instantsearch.js/package.json').version
        })`,
        `react-instantsearch (${
          require('../../../react-instantsearch-core/package.json').version
        })`,
        `react (${require('react').version})`,
      ],
    };
  },
  createHitsPerPageWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <HitsPerPage {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createClearRefinementsWidgetTests({ instantSearchOptions, widgetParams }) {
    const refinementListAttributes = Object.keys(
      instantSearchOptions.initialUiState?.indexName.refinementList || {}
    );

    render(
      <InstantSearch {...instantSearchOptions}>
        {refinementListAttributes.map((attribute) => (
          <RefinementList key={attribute} attribute={attribute} />
        ))}
        <CurrentRefinements />
        <ClearRefinements {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createCurrentRefinementsWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <form>
        <InstantSearch {...instantSearchOptions}>
          <SearchBox />
          <RefinementList attribute="brand" />
          <RefinementList operator="and" attribute="feature" />
          <HierarchicalMenu
            attributes={[
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ]}
          />
          <RangeInput attribute="price" />
          <CurrentRefinements {...widgetParams} />
          <GlobalErrorSwallower />
        </InstantSearch>
      </form>
    );
  },
  createToggleRefinementWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <ToggleRefinement {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createSearchBoxWidgetTests({
    instantSearchOptions,
    widgetParams: { autofocus, ...rest },
  }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <SearchBox {...rest} autoFocus={autofocus} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createSortByWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <SortBy {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
};

const testOptions: TestOptionsMap<TestSuites> = {
  createRefinementListWidgetTests: { act },
  createHierarchicalMenuWidgetTests: { act },
  createBreadcrumbWidgetTests: { act },
  createMenuWidgetTests: { act },
  createPaginationWidgetTests: { act },
  createInfiniteHitsWidgetTests: { act },
  createHitsWidgetTests: { act },
  createRangeInputWidgetTests: { act },
  createInstantSearchWidgetTests: { act },
  createHitsPerPageWidgetTests: { act },
  createClearRefinementsWidgetTests: { act },
  createCurrentRefinementsWidgetTests: { act },
  createToggleRefinementWidgetTests: { act },
  createSearchBoxWidgetTests: { act },
  createSortByWidgetTests: { act },
};

/**
 * prevent rethrowing InstantSearch errors, so tests can be asserted.
 * IRL this isn't needed, as the error doesn't stop execution.
 */
function GlobalErrorSwallower() {
  useInstantSearch({ catchError: true });

  return null;
}

describe('Common widget tests (React InstantSearch)', () => {
  runTestSuites({
    testSuites,
    testSetups,
    testOptions,
  });
});
