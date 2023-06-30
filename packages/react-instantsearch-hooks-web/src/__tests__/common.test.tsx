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
  createClearRefinementsTests,
  createHitsPerPageTests,
  createNumericMenuTests,
  createRatingMenuTests,
  createToggleRefinementTests,
  createCurrentRefinementsTests,
} from '@instantsearch/tests';
import { act, render } from '@testing-library/react';
import { connectRatingMenu } from 'instantsearch.js/es/connectors';
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
  usePagination,
  useBreadcrumb,
  useHierarchicalMenu,
  useClearRefinements,
  useHitsPerPage,
  HitsPerPage,
  useMenu,
  useNumericMenu,
  useConnector,
  useToggleRefinement,
  ToggleRefinement,
  useCurrentRefinements,
} from '..';

import type {
  UseBreadcrumbProps,
  UseClearRefinementsProps,
  UseCurrentRefinementsProps,
  UseHierarchicalMenuProps,
  UseHitsPerPageProps,
  UseMenuProps,
  UseNumericMenuProps,
  UsePaginationProps,
  UseRefinementListProps,
  UseToggleRefinementProps,
} from '..';
import type { Hit } from 'instantsearch.js';
import type {
  RatingMenuConnectorParams,
  RatingMenuRenderState,
} from 'instantsearch.js/es/connectors/rating-menu/connectRatingMenu';
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
  function HierarchicalMenuURL(props: UseHierarchicalMenuProps) {
    const { createURL } = useHierarchicalMenu(props);
    return (
      <a data-testid="HierarchicalMenu-link" href={createURL('value')}>
        LINK
      </a>
    );
  }

  render(
    <InstantSearch {...instantSearchOptions}>
      <HierarchicalMenuURL {...widgetParams} />
      <HierarchicalMenu {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createBreadcrumbTests(({ instantSearchOptions, widgetParams }) => {
  const { transformItems, ...hierarchicalWidgetParams } = widgetParams;
  function BreadcrumbURL(props: UseBreadcrumbProps) {
    const { createURL } = useBreadcrumb(props);
    return (
      <a data-testid="Breadcrumb-link" href={createURL('Apple > iPhone')}>
        LINK
      </a>
    );
  }
  render(
    <InstantSearch {...instantSearchOptions}>
      <BreadcrumbURL {...widgetParams} />
      <Breadcrumb {...widgetParams} />
      <HierarchicalMenu {...hierarchicalWidgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createMenuTests(({ instantSearchOptions, widgetParams }) => {
  function MenuURL(props: UseMenuProps) {
    const { createURL } = useMenu(props);
    return (
      <a data-testid="Menu-link" href={createURL('value')}>
        LINK
      </a>
    );
  }

  render(
    <InstantSearch {...instantSearchOptions}>
      <MenuURL {...widgetParams} />
      <Menu {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createPaginationTests(({ instantSearchOptions, widgetParams }) => {
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
      <PaginationURL {...widgetParams} />
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

createClearRefinementsTests(({ instantSearchOptions, widgetParams }) => {
  function ClearRefinementsURL(props: UseClearRefinementsProps) {
    const { createURL } = useClearRefinements(props);
    return (
      <a data-testid="ClearRefinements-link" href={createURL()}>
        LINK
      </a>
    );
  }

  render(
    <InstantSearch {...instantSearchOptions}>
      <ClearRefinementsURL {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
});

createCurrentRefinementsTests(({ instantSearchOptions, widgetParams }) => {
  function CurrentRefinementsURL(props: UseCurrentRefinementsProps) {
    const { createURL } = useCurrentRefinements(props);
    return (
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
    );
  }

  render(
    <InstantSearch {...instantSearchOptions}>
      <CurrentRefinementsURL {...widgetParams} />
      <RefinementList attribute="brand" />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createHitsPerPageTests(({ instantSearchOptions, widgetParams }) => {
  function HitsPerPageURL(props: UseHitsPerPageProps) {
    const { createURL } = useHitsPerPage(props);
    return (
      <a data-testid="HitsPerPage-link" href={createURL(12)}>
        LINK
      </a>
    );
  }

  render(
    <InstantSearch {...instantSearchOptions}>
      <HitsPerPageURL {...widgetParams} />
      <HitsPerPage {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createNumericMenuTests(({ instantSearchOptions, widgetParams }) => {
  function NumericMenuURL(props: UseNumericMenuProps) {
    const { createURL } = useNumericMenu(props);
    return (
      <a
        data-testid="NumericMenu-link"
        href={createURL(encodeURI('{ "start": 500 }'))}
      >
        LINK
      </a>
    );
  }

  render(
    <InstantSearch {...instantSearchOptions}>
      <NumericMenuURL {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createRatingMenuTests(({ instantSearchOptions, widgetParams }) => {
  function RatingMenuURL(props: RatingMenuConnectorParams) {
    const { createURL } = useConnector(
      connectRatingMenu,
      props
    ) as RatingMenuRenderState;
    return (
      <a data-testid="RatingMenu-link" href={createURL(encodeURI('5'))}>
        LINK
      </a>
    );
  }

  render(
    <InstantSearch {...instantSearchOptions}>
      <RatingMenuURL {...widgetParams} />
      <GlobalErrorSwallower />
    </InstantSearch>
  );
}, act);

createToggleRefinementTests(({ instantSearchOptions, widgetParams }) => {
  function ToggleRefinementURL(props: UseToggleRefinementProps) {
    const { createURL } = useToggleRefinement(props);
    return (
      <a data-testid="ToggleRefinement-link" href={createURL()}>
        LINK
      </a>
    );
  }

  render(
    <InstantSearch {...instantSearchOptions}>
      <ToggleRefinementURL {...widgetParams} />
      <ToggleRefinement {...widgetParams} />
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
