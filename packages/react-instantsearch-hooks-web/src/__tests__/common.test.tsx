/**
 * @jest-environment jsdom
 */
import {
  createRefinementListTests,
  createHierarchicalMenuTests,
  createBreadcrumbTests,
  createMenuTests,
  createPaginationTests,
  createInfiniteHitsTests,
  createHitsTests,
  createRangeInputTests,
  createInstantSearchTests,
} from '@instantsearch/tests';
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
  useRefinementList,
} from '..';

import type { UseRefinementListProps } from '..';
import type { Hit } from 'instantsearch.js';
import type { SendEventForHits } from 'instantsearch.js/es/lib/utils';

/**
 * prevent rethrowing InstantSearch errors, so tests can be asserted.
 * IRL this isn't needed, as the error doesn't stop execution.
 */
function GlobalErrorSwallower() {
  useInstantSearch({ catchError: true });

  return null;
}

createRefinementListTests(({ instantSearchOptions, widgetParams }) => {
  function RefinementListURL(props: UseRefinementListProps) {
    const { createURL } = useRefinementList(props);
    return (
      <a data-testid="RefinementList-link" href={createURL('value')}>
        LINK
      </a>
    );
  }
  render(
    <InstantSearch {...instantSearchOptions}>
      <RefinementList {...widgetParams} />
      <RefinementListURL {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createHierarchicalMenuTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <HierarchicalMenu {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createBreadcrumbTests(({ instantSearchOptions, widgetParams }) => {
  const { transformItems, ...hierarchicalWidgetParams } = widgetParams;
  render(
    <InstantSearch {...instantSearchOptions}>
      <Breadcrumb {...widgetParams} />
      <HierarchicalMenu {...hierarchicalWidgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createMenuTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <Menu {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createPaginationTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <Pagination {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createInfiniteHitsTests(({ instantSearchOptions, widgetParams }) => {
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
}, act);

createHitsTests(({ instantSearchOptions, widgetParams }) => {
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
      <Index indexName="nested">
        <Hits id="nested-hits" hitComponent={NestedHit} />
      </Index>
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createRangeInputTests(({ instantSearchOptions, widgetParams }) => {
  render(
    <InstantSearch {...instantSearchOptions}>
      <RangeInput {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createInstantSearchTests(({ instantSearchOptions }) => {
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
        require('../../../react-instantsearch-hooks/package.json').version
      })`,
      `react (${require('react').version})`,
    ],
  };
}, act);
