/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
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
  Stats,
  RelatedProducts,
  FrequentlyBoughtTogether,
  TrendingItems,
  LookingSimilar,
  PoweredBy,
  DynamicWidgets,
  Chat,
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
        <div id="hits-with-defaults">
          <InfiniteHits {...widgetParams} />
        </div>
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
  createRatingMenuWidgetTests() {
    throw new Error('RatingMenu is not supported in React InstantSearch');
  },
  createNumericMenuWidgetTests() {
    throw new Error('NumericMenu is not supported in React InstantSearch');
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
  createStatsWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <Stats {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createRelatedProductsWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <RelatedProducts {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createFrequentlyBoughtTogetherWidgetTests({
    instantSearchOptions,
    widgetParams,
  }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <FrequentlyBoughtTogether {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createTrendingItemsWidgetTests({ instantSearchOptions, widgetParams }) {
    const { facetName, facetValue, ...params } = widgetParams;
    const facetParams =
      facetName && facetValue ? { facetName, facetValue } : {};

    render(
      <InstantSearch {...instantSearchOptions}>
        <TrendingItems {...facetParams} {...params} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createLookingSimilarWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <LookingSimilar {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createPoweredByWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <PoweredBy {...widgetParams} />
        <GlobalErrorSwallower />
      </InstantSearch>
    );

    return {
      flavor: 'react-instantsearch',
    };
  },
  createMenuSelectWidgetTests() {
    throw new Error('MenuSelect is not supported in React InstantSearch');
  },
  createDynamicWidgetsWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <div className="ais-DynamicWidgets">
          <DynamicWidgets {...widgetParams}>
            <RefinementList attribute="brand" />
            <Menu attribute="category" />
            <HierarchicalMenu
              attributes={[
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
              ]}
            />
          </DynamicWidgets>
        </div>
        <GlobalErrorSwallower />
      </InstantSearch>
    );
  },
  createChatWidgetTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <div className="ais-Chat">
          <Chat {...widgetParams} />
        </div>
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
  createRatingMenuWidgetTests: {
    act,
    skippedTests: {
      'RatingMenu widget common tests': true,
    },
  },
  createInstantSearchWidgetTests: { act },
  createHitsPerPageWidgetTests: { act },
  createClearRefinementsWidgetTests: { act },
  createCurrentRefinementsWidgetTests: { act },
  createToggleRefinementWidgetTests: { act },
  createSearchBoxWidgetTests: { act },
  createSortByWidgetTests: { act },
  createStatsWidgetTests: { act },
  createNumericMenuWidgetTests: {
    act,
    skippedTests: {
      'NumericMenu widget common tests': true,
    },
  },
  createRelatedProductsWidgetTests: { act },
  createFrequentlyBoughtTogetherWidgetTests: { act },
  createTrendingItemsWidgetTests: { act },
  createLookingSimilarWidgetTests: { act },
  createPoweredByWidgetTests: { act },
  createMenuSelectWidgetTests: {
    act,
    skippedTests: {
      'MenuSelect widget common tests': true,
    },
  },
  createDynamicWidgetsWidgetTests: { act },
  createChatWidgetTests: {
    act,
  },
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
    flavor: 'react',
    testSuites,
    testSetups,
    testOptions,
  });
});
