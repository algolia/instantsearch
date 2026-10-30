/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { runTestSuites } from '@instantsearch/tests';
import * as suites from '@instantsearch/tests/connectors';
import { act, render } from '@testing-library/react';
import { connectRatingMenu } from 'instantsearch.js/es/connectors';
import React, { useState } from 'react';

import {
  Chat,
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
  useRelatedProducts,
  useFrequentlyBoughtTogether,
  useTrendingItems,
  useTrendingFacets,
  useLookingSimilar,
  useFilterSuggestions,
  useCompare,
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
  UseRelatedProductsProps,
  UseFrequentlyBoughtTogetherProps,
  UseTrendingItemsProps,
  UseTrendingFacetsProps,
  UseLookingSimilarProps,
  UseFilterSuggestionsProps,
  UseCompareProps,
} from '..';
import type { TestOptionsMap, TestSetupsMap } from '@instantsearch/tests';
import type {
  RatingMenuConnectorParams,
  RatingMenuWidgetDescription,
} from 'instantsearch.js/es/connectors/rating-menu/connectRatingMenu';

type TestSuites = typeof suites;
const testSuites: TestSuites = suites;

const testSetups: TestSetupsMap<TestSuites, 'react'> = {
  createRefinementListConnectorTests({ instantSearchOptions, widgetParams }) {
    function CustomRefinementList(props: UseRefinementListProps) {
      const { createURL, refine } = useRefinementList(props);
      return (
        <>
          <a data-testid="RefinementList-link" href={createURL('value')}>
            LINK
          </a>
          <form
            onSubmit={(event) => {
              refine(
                (event.currentTarget.elements.item(0) as HTMLInputElement).value
              );
            }}
          >
            <input type="text" data-testid="RefinementList-refine-input" />
          </form>
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
          <form
            onSubmit={(event) => {
              refine(
                (event.currentTarget.elements.item(0) as HTMLInputElement).value
              );
            }}
          >
            <input type="text" data-testid="HierarchicalMenu-refine-input" />
          </form>
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
          <form
            onSubmit={(event) => {
              refine(
                (event.currentTarget.elements.item(0) as HTMLInputElement).value
              );
            }}
          >
            <input type="text" data-testid="Menu-refine-input" />
          </form>
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
  createRelatedProductsConnectorTests: ({
    instantSearchOptions,
    widgetParams,
  }) => {
    function CustomRelatedProducts(props: UseRelatedProductsProps) {
      const { items } = useRelatedProducts(props);

      return (
        <ul>
          {items.map((item) => (
            <li key={item.objectID}>{item.objectID}</li>
          ))}
        </ul>
      );
    }

    function App() {
      const [visible, setVisible] = useState(true);
      return (
        <InstantSearch {...instantSearchOptions}>
          {visible && <CustomRelatedProducts {...widgetParams} />}
          <button onClick={() => setVisible(!visible)}>toggle</button>
        </InstantSearch>
      );
    }

    render(<App />);
  },
  createFrequentlyBoughtTogetherConnectorTests: ({
    instantSearchOptions,
    widgetParams,
  }) => {
    function CustomFrequentlyBoughtTogether(
      props: UseFrequentlyBoughtTogetherProps
    ) {
      const { items } = useFrequentlyBoughtTogether(props);

      return (
        <ul>
          {items.map((item) => (
            <li key={item.objectID}>{item.objectID}</li>
          ))}
        </ul>
      );
    }

    function App() {
      const [visible, setVisible] = useState(true);
      return (
        <InstantSearch {...instantSearchOptions}>
          {visible && <CustomFrequentlyBoughtTogether {...widgetParams} />}
          <button onClick={() => setVisible(!visible)}>toggle</button>
        </InstantSearch>
      );
    }

    render(<App />);
  },
  createTrendingItemsConnectorTests: ({
    instantSearchOptions,
    widgetParams,
  }) => {
    function CustomTrendingItems(props: UseTrendingItemsProps) {
      const { items } = useTrendingItems(props);

      return (
        <ul>
          {items.map((item) => (
            <li key={item.objectID}>{item.objectID}</li>
          ))}
        </ul>
      );
    }

    function App() {
      const [visible, setVisible] = useState(true);
      return (
        <InstantSearch {...instantSearchOptions}>
          {visible && <CustomTrendingItems {...widgetParams} />}
          <button onClick={() => setVisible(!visible)}>toggle</button>
        </InstantSearch>
      );
    }

    render(<App />);
  },
  createTrendingFacetsConnectorTests: ({
    instantSearchOptions,
    widgetParams,
  }) => {
    function CustomTrendingFacets(props: UseTrendingFacetsProps) {
      const { items } = useTrendingFacets(props);

      return (
        <ul>
          {items.map((item, i) => (
            <li key={i}>{item.facetValue}</li>
          ))}
        </ul>
      );
    }

    function App() {
      const [visible, setVisible] = useState(true);
      return (
        <InstantSearch {...instantSearchOptions}>
          {visible && <CustomTrendingFacets {...widgetParams} />}
          <button onClick={() => setVisible(!visible)}>toggle</button>
        </InstantSearch>
      );
    }

    render(<App />);
  },
  createLookingSimilarConnectorTests: ({
    instantSearchOptions,
    widgetParams,
  }) => {
    function CustomLookingSimilar(props: UseLookingSimilarProps) {
      const { items } = useLookingSimilar(props);

      return (
        <ul>
          {items.map((item) => (
            <li key={item.objectID}>{item.objectID}</li>
          ))}
        </ul>
      );
    }

    function App() {
      const [visible, setVisible] = useState(true);
      return (
        <InstantSearch {...instantSearchOptions}>
          {visible && <CustomLookingSimilar {...widgetParams} />}
          <button onClick={() => setVisible(!visible)}>toggle</button>
        </InstantSearch>
      );
    }

    render(<App />);
  },
  createChatConnectorTests: () => {},
  createFilterSuggestionsConnectorTests: ({
    instantSearchOptions,
    widgetParams,
  }) => {
    function CustomFilterSuggestions(props: UseFilterSuggestionsProps) {
      const { suggestions, refine, isLoading } = useFilterSuggestions(props);
      useRefinementList({ attribute: 'brand' });

      return (
        <div data-testid="FilterSuggestions-root">
          {isLoading && (
            <div data-testid="FilterSuggestions-loading">Loading...</div>
          )}
          <ul data-testid="FilterSuggestions-list">
            {suggestions.map((suggestion) => (
              <li key={`${suggestion.attribute}-${suggestion.value}`}>
                <button
                  data-testid="FilterSuggestions-refine"
                  onClick={() => refine(suggestion.attribute, suggestion.value)}
                >
                  {suggestion.label} ({suggestion.count})
                </button>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    render(
      <InstantSearch {...instantSearchOptions}>
        <CustomFilterSuggestions {...widgetParams} />
      </InstantSearch>
    );
  },
  createCompareConnectorTests: ({ instantSearchOptions, widgetParams }) => {
    const {
      products = [],
      renderChat = true,
      ...connectorParams
    } = widgetParams;

    function CustomCompare(props: UseCompareProps) {
      const [result, setResult] = useState('');
      const {
        items,
        isSelected,
        addItem,
        removeItem,
        toggleItem,
        clearItems,
        canAddItems,
        canCompare,
        minItems,
        maxItems,
        compare,
      } = useCompare(props);

      return (
        <div>
          <ul>
            {items.map((item) => (
              <li
                key={item.objectID}
                data-testid="Compare-item"
                data-object-id={item.objectID}
              >
                {item.objectID}
              </li>
            ))}
          </ul>
          <span data-testid="Compare-minItems">{minItems}</span>
          <span data-testid="Compare-maxItems">{maxItems}</span>
          <span data-testid="Compare-canAddItems">{String(canAddItems)}</span>
          <span data-testid="Compare-canCompare">{String(canCompare)}</span>
          {products.map((product) => (
            <React.Fragment key={product.objectID}>
              <button
                data-testid={`Compare-add-${product.objectID}`}
                onClick={() => addItem(product)}
              />
              <button
                data-testid={`Compare-remove-${product.objectID}`}
                onClick={() => removeItem(product.objectID)}
              />
              <button
                data-testid={`Compare-toggle-${product.objectID}`}
                aria-pressed={isSelected(product.objectID)}
                onClick={() => toggleItem(product)}
              />
            </React.Fragment>
          ))}
          <button data-testid="Compare-clear" onClick={clearItems} />
          <button
            data-testid="Compare-compare"
            onClick={() => setResult(String(compare()))}
          />
          <output data-testid="Compare-result">{result}</output>
        </div>
      );
    }

    render(
      <InstantSearch {...instantSearchOptions}>
        <CustomCompare {...connectorParams} />
        {/*
          A dedicated id: the `agentId` the chat suites use keys persisted
          messages in `sessionStorage` that leak across tests in this file.
        */}
        {renderChat && <Chat agentId="compareChatAgentId" />}
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
  createRelatedProductsConnectorTests: { act },
  createFrequentlyBoughtTogetherConnectorTests: { act },
  createTrendingItemsConnectorTests: { act },
  createTrendingFacetsConnectorTests: { act },
  createLookingSimilarConnectorTests: { act, skippedTests: { options: true } },
  createChatConnectorTests: { act, skippedTests: { options: true } },
  createFilterSuggestionsConnectorTests: { act },
  createCompareConnectorTests: { act },
};

describe('Common connector tests (React InstantSearch)', () => {
  runTestSuites({
    flavor: 'react',
    testSuites,
    testSetups,
    testOptions,
  });
});
