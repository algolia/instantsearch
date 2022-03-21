import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import connectHits from 'instantsearch.js/es/connectors/hits/connectHits';
import React from 'react';

import {
  createSearchClient,
  createSingleSearchResponse,
} from '../../../../../test/mock';
import { createInstantSearchTestWrapper } from '../../../../../test/utils';
import { Index } from '../../components/Index';
import { InstantSearch } from '../../components/InstantSearch';
import { IndexContext } from '../../lib/IndexContext';
import { InstantSearchContext } from '../../lib/InstantSearchContext';
import { noop } from '../../lib/noop';
import { useConnector } from '../useConnector';

import type {
  InstantSearch as InstantSearchType,
  Connector,
} from 'instantsearch.js';
import type {
  HitsConnectorParams,
  HitsWidgetDescription,
} from 'instantsearch.js/es/connectors/hits/connectHits';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

type CustomSearchBoxWidgetDescription = {
  $$type: 'test.searchBox';
  renderState: {
    query: string;
    refine(value: string): void;
  };
};

const connectCustomSearchBox: Connector<
  CustomSearchBoxWidgetDescription,
  Record<string, never>
> =
  (renderFn, unmountFn = noop) =>
  (widgetParams) => {
    const refineRef = { current: noop };

    return {
      $$type: 'test.searchBox',
      init(params) {
        renderFn(
          {
            ...this.getWidgetRenderState!(params),
            instantSearchInstance: params.instantSearchInstance,
          },
          true
        );
      },
      render(params) {
        renderFn(
          {
            ...this.getWidgetRenderState!(params),
            query: 'query',
            instantSearchInstance: params.instantSearchInstance,
          },
          false
        );
      },
      dispose() {
        unmountFn();
      },
      getWidgetRenderState({ helper, state }) {
        refineRef.current = (value) => helper.setQuery(value).search();

        return {
          query: state.query || '',
          refine: refineRef.current,
          widgetParams,
        };
      },
      getWidgetUiState(uiState, { searchParameters }) {
        return {
          ...uiState,
          query: searchParameters.query,
        };
      },
    };
  };

const connectCustomSearchBoxWithoutRenderState: Connector<
  CustomSearchBoxWidgetDescription,
  Record<string, never>
> =
  (renderFn, unmountFn = noop) =>
  (widgetParams) => {
    const refineRef = { current: noop };

    return {
      $$type: 'test.searchBox',
      init(params) {
        renderFn(
          {
            query: 'query at init',
            refine: refineRef.current,
            instantSearchInstance: params.instantSearchInstance,
            widgetParams,
          },
          true
        );
      },
      render(params) {
        refineRef.current = (value) => params.helper.setQuery(value).search();

        renderFn(
          {
            query: 'query',
            refine: refineRef.current,
            instantSearchInstance: params.instantSearchInstance,
            widgetParams,
          },
          false
        );
      },
      dispose() {
        unmountFn();
      },
      getWidgetUiState(uiState, { searchParameters }) {
        return {
          ...uiState,
          query: searchParameters.query,
        };
      },
    };
  };

describe('useConnector', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();

    const { result, waitForNextUpdate } = renderHook(
      () => useConnector(connectCustomSearchBox, {}, {}),
      { wrapper }
    );

    // Initial render state
    expect(result.current).toEqual({
      query: '',
      refine: expect.any(Function),
    });

    await waitForNextUpdate();

    // It should never be "query at init" because we skip the `init` step.
    expect(result.current).not.toEqual({
      query: 'query at init',
      refine: expect.any(Function),
    });

    // Render state provided by InstantSearch Core during `render`.
    expect(result.current).toEqual({
      query: 'query',
      refine: expect.any(Function),
    });
  });

  test('returns the connector render state in a child index', async () => {
    const searchClient = createSearchClient();

    function Wrapper({ children }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <Index indexName="childIndex">{children}</Index>
        </InstantSearch>
      );
    }

    const { result, waitForNextUpdate } = renderHook(
      () => useConnector(connectCustomSearchBox, {}, {}),
      { wrapper: Wrapper }
    );

    // Initial render state
    expect(result.current).toEqual({
      query: '',
      refine: expect.any(Function),
    });

    await waitForNextUpdate();

    // It should never be "query at init" because we skip the `init` step.
    expect(result.current).not.toEqual({
      query: 'query at init',
      refine: expect.any(Function),
    });

    // Render state provided by InstantSearch Core during `render`.
    expect(result.current).toEqual({
      query: 'query',
      refine: expect.any(Function),
    });
  });

  test('returns empty connector initial render state without getWidgetRenderState', async () => {
    const wrapper = createInstantSearchTestWrapper();

    const { result, waitForNextUpdate } = renderHook(
      () => useConnector(connectCustomSearchBoxWithoutRenderState, {}, {}),
      { wrapper }
    );

    expect(result.current).toEqual({});

    await waitForNextUpdate();
  });

  test('calls getWidgetRenderState with the InstantSearch render options and artificial results', () => {
    const getWidgetRenderState = jest.fn();
    const connectCustomSearchBoxMock =
      (renderFn, unmountFn) => (widgetParams) => ({
        ...connectCustomSearchBox(renderFn, unmountFn)(widgetParams),
        getWidgetRenderState,
      });
    const searchClient = createSearchClient();
    let searchContext: InstantSearchType | null = null;
    let indexContext: IndexWidget | null = null;

    function SearchProvider({ children }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <InstantSearchContext.Consumer>
            {(searchContextValue) => {
              searchContext = searchContextValue;

              return (
                <IndexContext.Consumer>
                  {(indexContextValue) => {
                    indexContext = indexContextValue;

                    return children;
                  }}
                </IndexContext.Consumer>
              );
            }}
          </InstantSearchContext.Consumer>
        </InstantSearch>
      );
    }

    renderHook(() => useConnector(connectCustomSearchBoxMock, {}, {}), {
      wrapper: SearchProvider,
    });

    expect(getWidgetRenderState).toHaveBeenCalledTimes(1);
    expect(getWidgetRenderState).toHaveBeenCalledWith({
      helper: expect.any(Object),
      parent: indexContext!,
      instantSearchInstance: searchContext!,
      results: expect.objectContaining({
        hitsPerPage: 20,
        __isArtificial: true,
      }),
      scopedResults: [
        {
          indexId: 'indexName',
          results: expect.objectContaining({ hitsPerPage: 20 }),
          helper: expect.any(Object),
        },
      ],
      state: expect.any(Object),
      renderState: searchContext!.renderState,
      templatesConfig: searchContext!.templatesConfig,
      createURL: indexContext!.createURL,
      searchMetadata: {
        isSearchStalled: false,
      },
    });
  });

  test('returns state from artificial results', () => {
    const searchClient = createSearchClient();

    function SearchProvider({ children }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          {children}
        </InstantSearch>
      );
    }

    function CustomWidget() {
      const state = useConnector<HitsConnectorParams, HitsWidgetDescription>(
        connectHits
      );

      return <>{`artificial results: ${state.results!.__isArtificial}`}</>;
    }

    const { container } = render(
      <SearchProvider>
        <CustomWidget />
      </SearchProvider>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        artificial results: true
      </div>
    `);
  });

  test('returns state from existing index results', () => {
    const searchClient = createSearchClient();

    const results = new SearchResults(new SearchParameters(), [
      createSingleSearchResponse(),
    ]);

    function SearchProvider({ children }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <IndexContext.Consumer>
            {(indexContextValue) => {
              return (
                <IndexContext.Provider
                  value={{
                    ...indexContextValue!,
                    // fake results, to simulate SSR, or a widget added after results
                    getResults() {
                      return results;
                    },
                  }}
                >
                  {children}
                </IndexContext.Provider>
              );
            }}
          </IndexContext.Consumer>
        </InstantSearch>
      );
    }

    function CustomWidget() {
      const state = useConnector<HitsConnectorParams, HitsWidgetDescription>(
        connectHits
      );

      return <>{`artificial results: ${state.results!.__isArtificial}`}</>;
    }

    const { container } = render(
      <SearchProvider>
        <CustomWidget />
      </SearchProvider>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        artificial results: undefined
      </div>
    `);
  });

  test('adds the widget to the parent index', () => {
    const searchClient = createSearchClient();
    let indexContext: IndexWidget | null = null;

    function CustomSearchBox() {
      useConnector<Record<never, never>, CustomSearchBoxWidgetDescription>(
        connectCustomSearchBox,
        {},
        { $$widgetType: 'test.customSearchBox' }
      );

      return null;
    }

    function InstantSearchMock({ children }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <IndexContext.Consumer>
            {(value) => {
              indexContext = {
                ...value!,
                addWidgets: jest.fn(),
                removeWidgets: jest.fn(),
              };

              return (
                <IndexContext.Provider value={indexContext}>
                  {children}
                </IndexContext.Provider>
              );
            }}
          </IndexContext.Consumer>
        </InstantSearch>
      );
    }

    const { unmount } = render(
      <InstantSearchMock>
        <CustomSearchBox />
      </InstantSearchMock>
    );

    expect(indexContext!.addWidgets).toHaveBeenCalledTimes(1);
    expect(indexContext!.addWidgets).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $$type: 'test.searchBox',
          $$widgetType: 'test.customSearchBox',
        }),
      ])
    );

    unmount();

    expect(indexContext!.removeWidgets).toHaveBeenCalledTimes(1);
    expect(indexContext!.removeWidgets).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $$type: 'test.searchBox',
          $$widgetType: 'test.customSearchBox',
        }),
      ])
    );
  });
});
