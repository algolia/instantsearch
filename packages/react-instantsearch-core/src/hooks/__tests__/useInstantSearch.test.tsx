/**
 * @jest-environment jsdom
 */

import { createAlgoliaSearchClient } from '@instantsearch/mocks';
import {
  createInstantSearchTestWrapper,
  InstantSearchTestWrapper,
  wait,
} from '@instantsearch/testutils';
import { render, waitFor, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlgoliaSearchHelper, SearchResults } from 'algoliasearch-helper';
import React, { useEffect } from 'react';
import { SearchBox } from 'react-instantsearch';

import { useInstantSearch } from '../useInstantSearch';

import type { UseInstantSearchProps } from '../useInstantSearch';

describe('useInstantSearch', () => {
  describe('usage', () => {
    test('it errors when not nested in InstantSearch', () => {
      expect(() => {
        renderHook(() => useInstantSearch());
      }).toThrowErrorMatchingInlineSnapshot(`
        "[InstantSearch] Hooks must be used inside the <InstantSearch> component.

        They are not compatible with the \`react-instantsearch-core@6.x\` and \`react-instantsearch-dom\` packages, so make sure to use the <InstantSearch> component from \`react-instantsearch-core@7.x\`."
      `);
    });
  });

  describe('results', () => {
    test('gives access to results', () => {
      const wrapper = createInstantSearchTestWrapper();
      const { result } = renderHook(() => useInstantSearch(), { wrapper });

      expect(result.current).toEqual(
        expect.objectContaining({
          results: expect.any(SearchResults),
          scopedResults: [
            expect.objectContaining({
              helper: expect.any(AlgoliaSearchHelper),
              indexId: 'indexName',
              results: expect.any(SearchResults),
            }),
          ],
        })
      );
    });
  });

  describe('ui state', () => {
    test('returns the ui state', () => {
      const wrapper = createInstantSearchTestWrapper();
      const { result } = renderHook(() => useInstantSearch(), { wrapper });

      expect(result.current).toEqual(
        expect.objectContaining({
          uiState: {
            indexName: {},
          },
          indexUiState: {},
          setUiState: expect.any(Function),
          setIndexUiState: expect.any(Function),
        })
      );
    });

    test('returns the ui state with initial state', () => {
      const wrapper = createInstantSearchTestWrapper({
        initialUiState: {
          indexName: {
            query: 'iphone',
          },
        },
      });
      const { result } = renderHook(() => useInstantSearch(), { wrapper });

      // Initial render state from manual `getWidgetRenderState`
      expect(result.current).toEqual(
        expect.objectContaining({
          uiState: {
            indexName: { query: 'iphone' },
          },
          indexUiState: { query: 'iphone' },
          setUiState: expect.any(Function),
          setIndexUiState: expect.any(Function),
        })
      );
    });

    test('returns a function to modify the whole state', async () => {
      function App() {
        const { uiState, setUiState } = useInstantSearch();

        return (
          <>
            <button
              type="button"
              data-testid="button"
              onClick={() => {
                setUiState({ indexName: { query: 'new query' } });
              }}
            >
              {uiState.indexName.query}
            </button>
            <SearchBox />
          </>
        );
      }

      const { findByTestId } = render(
        <InstantSearchTestWrapper>
          <App />
        </InstantSearchTestWrapper>
      );

      const button = await findByTestId('button');

      await waitFor(() => {
        expect(button).toHaveTextContent('');
      });

      userEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveTextContent('new query');
      });
    });

    test('returns a function to modify the index state', async () => {
      function App() {
        const { indexUiState, setIndexUiState } = useInstantSearch();

        return (
          <>
            <button
              type="button"
              data-testid="button"
              onClick={() => {
                setIndexUiState({ query: 'new query' });
              }}
            >
              {indexUiState.query}
            </button>
            <SearchBox />
          </>
        );
      }

      const { findByTestId } = render(
        <InstantSearchTestWrapper>
          <App />
        </InstantSearchTestWrapper>
      );

      const button = await findByTestId('button');

      await waitFor(() => {
        expect(button).toHaveTextContent('');
      });

      userEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveTextContent('new query');
      });
    });
  });

  describe('render state', () => {
    test('returns the render state', async () => {
      function App() {
        const { renderState } = useInstantSearch();

        return (
          <>
            <button
              type="button"
              data-testid="button"
              onClick={() => {
                renderState.indexName?.searchBox?.refine('new query');
              }}
            >
              {renderState.indexName?.searchBox?.query}
            </button>
            <pre data-testid="renderState">{JSON.stringify(renderState)}</pre>
            <SearchBox />
          </>
        );
      }

      const { getByTestId } = render(
        <InstantSearchTestWrapper>
          <App />
        </InstantSearchTestWrapper>
      );
      const button = getByTestId('button');
      const renderState = getByTestId('renderState');

      await waitFor(() => {
        expect(button).toHaveTextContent('');
        expect(renderState).toHaveTextContent(
          JSON.stringify({
            indexName: {
              searchBox: {
                query: '',
                widgetParams: {},
                isSearchStalled: false,
              },
            },
          })
        );
      });

      userEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveTextContent('new query');
        expect(renderState).toHaveTextContent(
          JSON.stringify({
            indexName: {
              searchBox: {
                query: 'new query',
                widgetParams: {},
                isSearchStalled: false,
              },
            },
          })
        );
      });
    });

    test('returns the index render state', async () => {
      function App() {
        const { indexRenderState } = useInstantSearch();

        return (
          <>
            <button
              type="button"
              data-testid="button"
              onClick={() => {
                indexRenderState.searchBox?.refine('new query');
              }}
            >
              {indexRenderState.searchBox?.query}
            </button>
            <pre data-testid="indexRenderState">
              {JSON.stringify(indexRenderState)}
            </pre>
            <SearchBox />
          </>
        );
      }

      const { getByTestId } = render(
        <InstantSearchTestWrapper>
          <App />
        </InstantSearchTestWrapper>
      );
      const button = getByTestId('button');
      const indexRenderState = getByTestId('indexRenderState');

      await waitFor(() => {
        expect(button).toHaveTextContent('');
        expect(indexRenderState).toHaveTextContent(
          JSON.stringify({
            searchBox: {
              query: '',
              widgetParams: {},
              isSearchStalled: false,
            },
          })
        );
      });

      userEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveTextContent('new query');
        expect(indexRenderState).toHaveTextContent(
          JSON.stringify({
            searchBox: {
              query: 'new query',
              widgetParams: {},
              isSearchStalled: false,
            },
          })
        );
      });
    });
  });

  describe('middleware', () => {
    test('gives access to the addMiddlewares function', async () => {
      const subscribe = jest.fn();
      const onStateChange = jest.fn();
      const unsubscribe = jest.fn();
      const middleware = jest.fn(() => ({
        subscribe,
        onStateChange,
        unsubscribe,
      }));

      function Middleware() {
        const { addMiddlewares } = useInstantSearch();
        useEffect(() => addMiddlewares(middleware), [addMiddlewares]);

        return null;
      }

      function App() {
        return (
          <InstantSearchTestWrapper>
            <Middleware />
            <SearchBox placeholder="searchbox" />
          </InstantSearchTestWrapper>
        );
      }

      const { unmount, findByPlaceholderText } = render(<App />);

      expect(middleware).toHaveBeenCalledTimes(1);
      expect(subscribe).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalledTimes(0);
      expect(unsubscribe).toHaveBeenCalledTimes(0);

      // simulate a change in query
      const searchBox = await findByPlaceholderText('searchbox');
      userEvent.type(searchBox, 'new query');

      await waitFor(() => {
        expect(middleware).toHaveBeenCalledTimes(1);
      });

      expect(subscribe).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalledTimes(1);
      expect(unsubscribe).toHaveBeenCalledTimes(0);

      unmount();

      expect(middleware).toHaveBeenCalledTimes(1);
      expect(subscribe).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalledTimes(1);
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    test('provides a stable reference', () => {
      const wrapper = createInstantSearchTestWrapper();
      const { result, rerender } = renderHook(() => useInstantSearch(), {
        wrapper,
      });

      expect(result.current.addMiddlewares).toBeInstanceOf(Function);

      const ref = result.current.addMiddlewares;

      rerender();

      expect(result.current.addMiddlewares).toBe(ref);
    });
  });

  describe('refresh', () => {
    test('refreshes the search', async () => {
      const searchClient = createAlgoliaSearchClient({});
      function Refresh() {
        const { refresh } = useInstantSearch();

        return (
          <button
            type="button"
            data-testid="refresh-button"
            onClick={() => {
              refresh();
            }}
          >
            Refresh
          </button>
        );
      }

      const { getByTestId } = render(
        <InstantSearchTestWrapper searchClient={searchClient}>
          <SearchBox />
          <Refresh />
        </InstantSearchTestWrapper>
      );
      const refreshButton = getByTestId('refresh-button');

      await waitFor(() => {
        expect(searchClient.search).toHaveBeenCalledTimes(1);
      });

      userEvent.click(refreshButton);

      expect(searchClient.search).toHaveBeenCalledTimes(2);
    });

    test('provides a stable reference', () => {
      const wrapper = createInstantSearchTestWrapper();
      const { result, rerender } = renderHook(() => useInstantSearch(), {
        wrapper,
      });

      expect(result.current.refresh).toBeInstanceOf(Function);

      const ref = result.current.refresh;

      rerender();

      expect(result.current.refresh).toBe(ref);
    });
  });

  describe('status', () => {
    test('initial status: idle', () => {
      const App = () => (
        <InstantSearchTestWrapper>
          <SearchBox />
          <Status />
        </InstantSearchTestWrapper>
      );

      const { getByTestId } = render(<App />);

      expect(getByTestId('status')).toHaveTextContent('idle');
    });

    test('turns to loading and idle when searching', async () => {
      const App = () => (
        <InstantSearchTestWrapper searchClient={createDelayedSearchClient(20)}>
          <SearchBox placeholder="search here" />
          <Status />
        </InstantSearchTestWrapper>
      );

      const { getByTestId, getByPlaceholderText } = render(<App />);

      expect(getByTestId('status')).toHaveTextContent('idle');

      userEvent.type(getByPlaceholderText('search here'), 'hey search');

      await waitFor(() => {
        expect(getByTestId('status')).toHaveTextContent('loading');
      });

      await waitFor(() => {
        expect(getByTestId('status')).toHaveTextContent('idle');
      });
    });

    test('turns to loading, stalled and idle when searching slowly', async () => {
      const App = () => (
        <InstantSearchTestWrapper
          searchClient={createDelayedSearchClient(300)}
          stalledSearchDelay={200}
        >
          <SearchBox placeholder="search here" />
          <Status />
        </InstantSearchTestWrapper>
      );

      const { getByTestId, getByPlaceholderText } = render(<App />);

      expect(getByTestId('status')).toHaveTextContent('idle');

      userEvent.type(getByPlaceholderText('search here'), 'h');

      await waitFor(() => {
        expect(getByTestId('status')).toHaveTextContent('loading');
      });

      await waitFor(() => {
        expect(getByTestId('status')).toHaveTextContent('stalled');
      });

      await waitFor(() => {
        expect(getByTestId('status')).toHaveTextContent('idle');
      });
    });

    test('turns to loading and error when searching', async () => {
      const searchClient = createAlgoliaSearchClient({});
      searchClient.search.mockImplementation(async () => {
        await wait(100);
        throw new Error('API_ERROR');
      });

      const App = () => (
        <InstantSearchTestWrapper searchClient={searchClient}>
          <SearchBox placeholder="search here" />
          {/* has catchError, as the real error can not be asserted upon */}
          <Status catchError />
        </InstantSearchTestWrapper>
      );

      const { getByTestId, getByPlaceholderText } = render(<App />);

      expect(getByTestId('status')).toHaveTextContent('idle');
      expect(getByTestId('error')).toBeEmptyDOMElement();

      userEvent.type(getByPlaceholderText('search here'), 'hey search');

      await waitFor(() => {
        expect(getByTestId('status')).toHaveTextContent('loading');
        expect(getByTestId('error')).toBeEmptyDOMElement();
      });

      await waitFor(() => {
        expect(getByTestId('status')).toHaveTextContent('error');
        expect(getByTestId('error')).toHaveTextContent('API_ERROR');
      });
    });

    function Status(props: UseInstantSearchProps) {
      const { status, error } = useInstantSearch(props);

      return (
        <>
          <span data-testid="status">{status}</span>
          <span data-testid="error">{error?.message}</span>
        </>
      );
    }

    function createDelayedSearchClient(timeout: number) {
      const searchFn = createAlgoliaSearchClient({}).search;
      return createAlgoliaSearchClient({
        search: (requests) => wait(timeout).then(() => searchFn(requests)),
      });
    }
  });
});
