/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import {
  createInstantSearchTestWrapper,
  createInstantSearchSpy,
} from '@instantsearch/testutils';
import { render, waitFor, renderHook } from '@testing-library/react';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import connectConfigure from 'instantsearch.js/es/connectors/configure/connectConfigure';
import connectHits from 'instantsearch.js/es/connectors/hits/connectHits';
import connectPagination from 'instantsearch.js/es/connectors/pagination/connectPagination';
import connectRefinementList from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';
import React, { StrictMode, useState } from 'react';

import { Index } from '../../components/Index';
import { InstantSearch } from '../../components/InstantSearch';
import { InstantSearchSSRProvider } from '../../components/InstantSearchSSRProvider';
import { useHits } from '../../connectors/useHits';
import { IndexContext } from '../../lib/IndexContext';
import { noop } from '../../lib/noop';
import { useConnector } from '../useConnector';

import type { UseHitsProps } from '../../connectors/useHits';
import type { PlainSearchParameters } from 'algoliasearch-helper';
import type { Connector } from 'instantsearch.js';
import type {
  HitsConnectorParams,
  HitsWidgetDescription,
} from 'instantsearch.js/es/connectors/hits/connectHits';

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

type FunctionOnlyUpdateWidgetDescription = {
  $$type: 'test.functionOnlyUpdate';
  renderState: {
    readPhase: () => string;
  };
};

const connectFunctionOnlyUpdate: Connector<
  FunctionOnlyUpdateWidgetDescription,
  Record<string, never>
> = (renderFn) => (widgetParams) => {
  let phase = 'before-init';

  const getWidgetRenderState = () => {
    const capturedPhase = phase;

    return {
      readPhase: () => capturedPhase,
      widgetParams,
    };
  };

  return {
    $$type: 'test.functionOnlyUpdate',
    init(params) {
      phase = 'after-init';
      renderFn(
        {
          ...getWidgetRenderState(),
          instantSearchInstance: params.instantSearchInstance,
        },
        true
      );
    },
    render(params) {
      renderFn(
        {
          ...getWidgetRenderState(),
          instantSearchInstance: params.instantSearchInstance,
        },
        false
      );
    },
    dispose() {},
    getWidgetRenderState,
  };
};

describe('useConnector', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();

    const { result } = renderHook(
      () => useConnector(connectCustomSearchBox, {}, {}),
      { wrapper }
    );

    // Initial render state
    expect(result.current).toEqual({
      query: '',
      refine: expect.any(Function),
    });

    await waitFor(() => {
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

    const { result } = renderHook(
      () => useConnector(connectCustomSearchBox, {}, {}),
      { wrapper: Wrapper }
    );

    // Initial render state
    expect(result.current).toEqual({
      query: '',
      refine: expect.any(Function),
    });

    await waitFor(() => {
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
  });

  test('returns empty connector initial render state without getWidgetRenderState', () => {
    const wrapper = createInstantSearchTestWrapper();

    const { result } = renderHook(
      () => useConnector(connectCustomSearchBoxWithoutRenderState, {}, {}),
      { wrapper }
    );

    expect(result.current).toEqual({});
  });

  test('returns a callback updated after the connector initializes', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result } = renderHook(
      () => useConnector(connectFunctionOnlyUpdate),
      {
        wrapper,
      }
    );

    await waitFor(() => {
      expect(result.current.readPhase()).toBe('after-init');
    });
  });

  test('calls getWidgetRenderState with the InstantSearch render options and artificial results', () => {
    const getWidgetRenderState = jest.fn(() => ({}));
    const connectCustomSearchBoxMock: Connector<
      CustomSearchBoxWidgetDescription,
      Record<string, unknown>
    > = (renderFn, unmountFn) => (widgetParams) => ({
      ...connectCustomSearchBox(renderFn, unmountFn)(widgetParams),
      // @ts-expect-error
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

    expect(getWidgetRenderState).toHaveBeenCalledTimes(2);
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
      templatesConfig: searchContext.current!.templatesConfig,
      createURL: indexContext.current!.createURL,
      searchMetadata: {
        isSearchStalled: false,
      },
      status: 'idle',
      error: undefined,
    });
  });

  test('calls getWidgetRenderState with recommend results if available', () => {
    const result = createSingleSearchResponse();
    const getWidgetRenderState = jest.fn(() => ({}));
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
            init: jest.fn(),
            render: jest.fn(),
            dispose: jest.fn(),
            getWidgetParameters: jest.fn(),
            getRenderState: jest.fn(),
            // @ts-expect-error
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
    expect(indexContext.current!.updateWidget).toHaveBeenCalledTimes(1);
    expect(indexContext.current!.removeWidgets).toHaveBeenCalledTimes(0);
    expect(indexContext.current!.addWidgets).toHaveBeenCalledTimes(1);
    expect(getByTestId('attribute')).toHaveTextContent('categories');
  });

  test('replaces the widget when additional widget properties change', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchSpy, indexContext } = createInstantSearchSpy();

    function CustomWidgetWithDependency({
      dependsOn,
    }: {
      dependsOn: 'search' | 'none';
    }) {
      useConnector(connectCustomWidget, { attribute: 'brands' }, { dependsOn });

      return null;
    }

    function App({ dependsOn }: { dependsOn: 'search' | 'none' }) {
      return (
        <InstantSearchSpy searchClient={searchClient} indexName="indexName">
          <CustomWidgetWithDependency dependsOn={dependsOn} />
        </InstantSearchSpy>
      );
    }

    const { rerender } = render(<App dependsOn="search" />);

    expect(indexContext.current!.addWidgets).toHaveBeenLastCalledWith([
      expect.objectContaining({ dependsOn: 'search' }),
    ]);

    rerender(<App dependsOn="none" />);

    await waitFor(() =>
      expect(indexContext.current!.updateWidget).toHaveBeenCalledTimes(1)
    );
    expect(indexContext.current!.updateWidget).toHaveBeenLastCalledWith(
      expect.objectContaining({ dependsOn: 'search' }),
      expect.objectContaining({ dependsOn: 'none' })
    );
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
    expect(indexContext.current!.updateWidget).toHaveBeenCalledTimes(1);
    expect(indexContext.current!.removeWidgets).toHaveBeenCalledTimes(0);
    expect(indexContext.current!.addWidgets).toHaveBeenCalledTimes(1);
  });

  // Ideally we would like to avoid this behavior, but we don't have any way
  // to memo function props, so they're always considered as new reference.
  test('always updates the widget on rerenders when using an unstable function prop', async () => {
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
    expect(indexContext.current!.updateWidget).toHaveBeenCalledTimes(1);
    expect(indexContext.current!.removeWidgets).toHaveBeenCalledTimes(0);
    expect(indexContext.current!.addWidgets).toHaveBeenCalledTimes(1);
  });

  test.each([true, false])(
    'keeps the widget uiState on a prop change (preserveSharedStateOnUnmount: %s)',
    async (preserveSharedStateOnUnmount) => {
      const searchClient = createSearchClient({});

      function Pagination({ padding }: { padding: number }) {
        const { currentRefinement } = useConnector(connectPagination, {
          padding,
        });

        return <div data-testid="page">{currentRefinement}</div>;
      }

      function App({ padding }: { padding: number }) {
        return (
          <InstantSearch
            searchClient={searchClient}
            indexName="indexName"
            initialUiState={{ indexName: { page: 4 } }}
            future={{ preserveSharedStateOnUnmount }}
          >
            <Pagination padding={padding} />
          </InstantSearch>
        );
      }

      const { rerender, getByTestId } = render(<App padding={2} />);

      await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));
      expect(getByTestId('page')).toHaveTextContent('3');

      rerender(<App padding={3} />);

      await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(2));
      expect(getByTestId('page')).toHaveTextContent('3');
    }
  );

  test('forgets the uiState the new widget params no longer claim', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchSpy, searchContext } = createInstantSearchSpy();

    function RefinementList({ attribute }: { attribute: string }) {
      useConnector(connectRefinementList, { attribute });

      return null;
    }

    function App({ attribute }: { attribute: string }) {
      return (
        <InstantSearchSpy
          searchClient={searchClient}
          indexName="indexName"
          initialUiState={{
            indexName: { refinementList: { brand: ['Apple'] } },
          }}
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <RefinementList attribute={attribute} />
        </InstantSearchSpy>
      );
    }

    const { rerender } = render(<App attribute="brand" />);

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));
    expect(searchContext.current!.getUiState()).toEqual({
      indexName: { refinementList: { brand: ['Apple'] } },
    });

    rerender(<App attribute="categories" />);

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(2));
    // The refinement on `brand` is dropped: no mounted widget claims it anymore.
    expect(searchContext.current!.getUiState()).toEqual({ indexName: {} });
  });

  test('keeps the widget in place among its siblings on a prop change', async () => {
    const searchClient = createSearchClient({});

    function Configure({
      searchParameters,
    }: {
      searchParameters: PlainSearchParameters;
    }) {
      useConnector(connectConfigure, { searchParameters });

      return null;
    }

    function App({ analyticsTag }: { analyticsTag: string }) {
      return (
        <InstantSearch
          searchClient={searchClient}
          indexName="indexName"
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <Configure
            searchParameters={{
              hitsPerPage: 10,
              analyticsTags: [analyticsTag],
            }}
          />
          {/* This widget comes last, so it wins on `hitsPerPage`. */}
          <Configure searchParameters={{ hitsPerPage: 20 }} />
        </InstantSearch>
      );
    }

    const { rerender } = render(<App analyticsTag="a" />);

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));
    expect(searchClient.search).toHaveBeenLastCalledWith([
      expect.objectContaining({
        params: expect.objectContaining({ hitsPerPage: 20 }),
      }),
    ]);

    // Updating the first widget must not move it after the second one.
    rerender(<App analyticsTag="b" />);

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(2));
    expect(searchClient.search).toHaveBeenLastCalledWith([
      expect.objectContaining({
        params: expect.objectContaining({
          hitsPerPage: 20,
          analyticsTags: ['b'],
        }),
      }),
    ]);
  });
});
