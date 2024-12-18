/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  createInstantSearchTestWrapper,
  createInstantSearchSpy,
} from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import { connectHits } from 'instantsearch-core';
import React, { StrictMode, useState } from 'react';

import { Index } from '../../components/Index';
import { InstantSearch } from '../../components/InstantSearch';
import { InstantSearchSSRProvider } from '../../components/InstantSearchSSRProvider';
import { useHits } from '../../connectors/useHits';
import { IndexContext } from '../../lib/IndexContext';
import { noop } from '../../lib/noop';
import { useConnector } from '../useConnector';

import type { UseHitsProps } from '../../connectors/useHits';
import type {
  Connector,
  HitsConnectorParams,
  HitsWidgetDescription,
} from 'instantsearch-core';

type CustomSearchBoxWidgetDescription = {
  $$type: 'test.searchBox';
  renderState: {
    query: string;
    refine: (value: string) => void;
  };
};

const connectCustomSearchBox: Connector<
  CustomSearchBoxWidgetDescription,
  Record<string, any>
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
      getWidgetSearchParameters(searchParameters, { uiState }) {
        return searchParameters.setQueryParameter('query', uiState.query || '');
      },
    };
  };

function CustomSearchBox(props: Record<string, any>) {
  useConnector<Record<never, never>, CustomSearchBoxWidgetDescription>(
    connectCustomSearchBox,
    props
  );
  return null;
}

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

const connectUnstableSearchBox: Connector<
  CustomSearchBoxWidgetDescription,
  Record<string, never>
> =
  (renderFn, unmountFn = noop) =>
  (widgetParams) => {
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
        return {
          query: state.query || '',
          // This creates a new reference for `refine()` at every render.
          refine: (value) => helper.setQuery(value).search(),
          widgetParams,
        };
      },
      getWidgetUiState(uiState, { searchParameters }) {
        return {
          ...uiState,
          query: searchParameters.query,
        };
      },
      getWidgetSearchParameters(searchParameters, { uiState }) {
        return searchParameters.setQueryParameter('query', uiState.query || '');
      },
    };
  };

type CustomWidgetParams = Record<string, any>;

type CustomWidgetDescription = {
  $$type: 'test.customWidget';
  renderState: Record<string, any>;
};

const connectCustomWidget: Connector<
  CustomWidgetDescription,
  CustomWidgetParams
> =
  (renderFn, unmountFn = noop) =>
  (widgetParams) => {
    return {
      $$type: 'test.customWidget',
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
            instantSearchInstance: params.instantSearchInstance,
          },
          false
        );
      },
      dispose() {
        unmountFn();
      },
      getWidgetRenderState() {
        return {
          widgetParams,
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
    const searchClient = createSearchClient({});

    function Wrapper({ children }: { children: React.ReactNode }) {
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
    const connectCustomSearchBoxMock: Connector<
      CustomSearchBoxWidgetDescription,
      Record<string, never>
    > = (renderFn, unmountFn) => (widgetParams) => ({
      ...connectCustomSearchBox(renderFn, unmountFn)(widgetParams),
      getWidgetRenderState,
    });
    const searchClient = createSearchClient({});
    const { InstantSearchSpy, indexContext, searchContext } =
      createInstantSearchSpy();

    function SearchProvider({ children }: { children: React.ReactNode }) {
      return (
        <InstantSearchSpy
          searchClient={searchClient}
          indexName="indexName"
          initialUiState={{
            indexName: {
              query: 'query',
            },
          }}
        >
          {children}
        </InstantSearchSpy>
      );
    }

    renderHook(() => useConnector(connectCustomSearchBoxMock, {}, {}), {
      wrapper: SearchProvider,
    });

    const helperState = {
      disjunctiveFacets: [],
      disjunctiveFacetsRefinements: {},
      facets: [],
      facetsExcludes: {},
      facetsRefinements: {},
      hierarchicalFacets: [],
      hierarchicalFacetsRefinements: {},
      index: 'indexName',
      numericRefinements: {},
      query: 'query',
      tagRefinements: [],
    };

    expect(getWidgetRenderState).toHaveBeenCalledTimes(1);
    expect(getWidgetRenderState).toHaveBeenCalledWith({
      helper: expect.objectContaining({
        state: helperState,
      }),
      parent: indexContext.current!,
      instantSearchInstance: searchContext.current!,
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
      state: helperState,
      renderState: searchContext.current!.renderState,
      createURL: indexContext.current!.createURL,
      status: 'idle',
      error: undefined,
    });
  });

  test('calls getWidgetRenderState with recommend results if available', () => {
    const result = createSingleSearchResponse();
    const getWidgetRenderState = jest.fn();
    const searchClient = createSearchClient({});
    const { InstantSearchSpy } = createInstantSearchSpy();

    function SearchProvider({ children }: { children: React.ReactNode }) {
      return (
        <InstantSearchSSRProvider
          initialResults={{
            indexName: {
              recommendResults: {
                params: [{ $$id: 0, objectID: 'a' }],
                results: { 0: result },
              },
            },
          }}
        >
          <InstantSearchSpy searchClient={searchClient} indexName="indexName">
            {children}
          </InstantSearchSpy>
        </InstantSearchSSRProvider>
      );
    }

    renderHook(
      () =>
        useConnector(
          () => () => ({
            $$type: '',
            dependsOn: 'recommend',
            getWidgetParameters: jest.fn(),
            getRenderState: jest.fn(),
            getWidgetRenderState,
          }),
          {},
          {}
        ),
      {
        wrapper: SearchProvider,
      }
    );

    expect(getWidgetRenderState).toHaveBeenCalledWith(
      expect.objectContaining({ results: result })
    );
  });

  test('returns state from artificial results', () => {
    const searchClient = createSearchClient({});

    function SearchProvider({ children }: { children: React.ReactNode }) {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          {children}
        </InstantSearch>
      );
    }

    function CustomHitsWidget() {
      const state = useConnector<HitsConnectorParams, HitsWidgetDescription>(
        connectHits
      );

      return <>{`artificial results: ${state.results!.__isArtificial}`}</>;
    }

    const { container } = render(
      <SearchProvider>
        <CustomHitsWidget />
      </SearchProvider>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        artificial results: true
      </div>
    `);
  });

  test('returns state from existing index results', () => {
    const searchClient = createSearchClient({});

    const results = new SearchResults(new SearchParameters(), [
      createSingleSearchResponse(),
    ]);

    function SearchProvider({ children }: { children: React.ReactNode }) {
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

    function CustomHitsWidget() {
      const state = useConnector<HitsConnectorParams, HitsWidgetDescription>(
        connectHits
      );

      return <>{`artificial results: ${state.results!.__isArtificial}`}</>;
    }

    const { container } = render(
      <SearchProvider>
        <CustomHitsWidget />
      </SearchProvider>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        artificial results: undefined
      </div>
    `);
  });

  test('runs the widget lifecycle', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchSpy, indexContext } = createInstantSearchSpy();

    function App() {
      return (
        <StrictMode>
          <InstantSearchSpy searchClient={searchClient} indexName="indexName">
            <CustomSearchBox />
          </InstantSearchSpy>
        </StrictMode>
      );
    }

    // Step 1: we render the widget for the first time.
    const { unmount, rerender } = render(<App />);

    expect(indexContext.current!.addWidgets).toHaveBeenCalledTimes(1);
    expect(indexContext.current!.addWidgets).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $$type: 'test.searchBox' }),
      ])
    );

    // Step 2: we rerender the widget with the same props
    rerender(<App />);

    // We rerendered the widget with the same props so we shouldn't
    // remove/add it again.
    expect(indexContext.current!.removeWidgets).toHaveBeenCalledTimes(0);
    expect(indexContext.current!.addWidgets).toHaveBeenCalledTimes(1);

    // Step 3: we unmount the widget.
    unmount();

    await waitFor(() =>
      expect(indexContext.current!.removeWidgets).toHaveBeenCalledTimes(1)
    );
    expect(indexContext.current!.removeWidgets).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $$type: 'test.searchBox' }),
      ])
    );
    expect(indexContext.current!.getWidgets()).toEqual([]);
  });

  test('limits the number of renders with unstable function references from render state', async () => {
    const searchClient = createSearchClient({});

    function Hits(props: UseHitsProps) {
      useHits(props);
      return null;
    }

    function Search() {
      // Use a connector with unstable function references in render state
      const { query } = useConnector(connectUnstableSearchBox);

      return (
        <>
          <input value={query} />
          {/* Use unstable function as prop */}
          <Hits transformItems={(items) => items} />
        </>
      );
    }

    function App() {
      return (
        <StrictMode>
          <InstantSearch searchClient={searchClient} indexName="indexName">
            <Search />
          </InstantSearch>
        </StrictMode>
      );
    }

    render(<App />);

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));
  });

  function CustomWidget(props: CustomWidgetParams) {
    useConnector(connectCustomWidget, props);
    return <div data-testid="attribute">{props.attribute}</div>;
  }

  test('rerenders the widget on prop change', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchSpy, indexContext } = createInstantSearchSpy();

    function App({ attribute }: { attribute: string }) {
      return (
        <StrictMode>
          <InstantSearchSpy searchClient={searchClient} indexName="indexName">
            <CustomWidget attribute={attribute} />
          </InstantSearchSpy>
        </StrictMode>
      );
    }

    const { rerender, getByTestId } = render(<App attribute="brands" />);

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));
    expect(indexContext.current!.addWidgets).toHaveBeenCalledTimes(1);
    expect(getByTestId('attribute')).toHaveTextContent('brands');

    rerender(<App attribute="categories" />);

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(2));
    expect(indexContext.current!.removeWidgets).toHaveBeenCalledTimes(1);
    expect(indexContext.current!.addWidgets).toHaveBeenCalledTimes(2);
    expect(getByTestId('attribute')).toHaveTextContent('categories');
  });

  test('rerenders the widget on state change', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchSpy, indexContext } = createInstantSearchSpy();

    function App() {
      const [attribute, setAttribute] = useState('brands');

      return (
        <StrictMode>
          <InstantSearchSpy searchClient={searchClient} indexName="indexName">
            <CustomWidget attribute={attribute} />
            <button onClick={() => setAttribute('categories')}>
              Change attribute
            </button>
          </InstantSearchSpy>
        </StrictMode>
      );
    }

    const { getByRole, getByTestId } = render(<App />);
    const button = getByRole('button');

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));
    expect(getByTestId('attribute')).toHaveTextContent('brands');
    expect(indexContext.current!.addWidgets).toHaveBeenCalledTimes(1);

    button.click();

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(2));
    expect(getByTestId('attribute')).toHaveTextContent('categories');
    expect(indexContext.current!.removeWidgets).toHaveBeenCalledTimes(1);
    expect(indexContext.current!.addWidgets).toHaveBeenCalledTimes(2);
  });

  // Ideally we would like to avoid this behavior, but we don't have any way
  // to memo function props, so they're always considered as new reference.
  test('always removes/adds the widget on rerenders when using an unstable function prop', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchSpy, indexContext } = createInstantSearchSpy();

    function App({ callback }: { callback: () => void }) {
      return (
        <StrictMode>
          <InstantSearchSpy searchClient={searchClient} indexName="indexName">
            <CustomWidget callback={callback} />
          </InstantSearchSpy>
        </StrictMode>
      );
    }

    const { rerender } = render(<App callback={() => {}} />);

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));
    expect(indexContext.current!.addWidgets).toHaveBeenCalledTimes(1);

    rerender(<App callback={() => {}} />);

    // This checks that InstantSearch doesn't re-render endlessly. We should
    // still be able to optimize this render count to `1`, but `2` is acceptable
    // for now compared to an infinite loop.
    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(2));
    expect(indexContext.current!.removeWidgets).toHaveBeenCalledTimes(1);
    expect(indexContext.current!.addWidgets).toHaveBeenCalledTimes(2);
  });
});
