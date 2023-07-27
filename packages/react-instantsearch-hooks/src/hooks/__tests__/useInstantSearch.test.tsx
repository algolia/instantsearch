/**
 * @jest-environment jsdom
 */

import { createAlgoliaSearchClient } from '@instantsearch/mocks';
import {
  createInstantSearchTestWrapper,
  InstantSearchHooksTestWrapper,
  wait,
} from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import { AlgoliaSearchHelper, SearchResults } from 'algoliasearch-helper';
import React, { useEffect } from 'react';
import { SearchBox } from 'react-instantsearch-hooks-web';

import { useInstantSearch } from '../useInstantSearch';

import type { UseInstantSearchProps } from '../useInstantSearch';

describe('useInstantSearch', () => {
  describe('usage', () => {
    test('it errors when not nested in InstantSearch', () => {
      const { result } = renderHook(() => useInstantSearch());

      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toMatchInlineSnapshot(`
        "[InstantSearch] Hooks must be used inside the <InstantSearch> component.

        They are not compatible with the \`react-instantsearch-core\` and \`react-instantsearch-dom\` packages, so make sure to use the <InstantSearch> component from \`react-instantsearch-hooks\`."
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

  describe('state', () => {
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
        <InstantSearchHooksTestWrapper>
          <App />
        </InstantSearchHooksTestWrapper>
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
        <InstantSearchHooksTestWrapper>
          <App />
        </InstantSearchHooksTestWrapper>
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
          <InstantSearchHooksTestWrapper>
            <Middleware />
            <SearchBox placeholder="searchbox" />
          </InstantSearchHooksTestWrapper>
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
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <SearchBox />
          <Refresh />
        </InstantSearchHooksTestWrapper>
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
        <InstantSearchHooksTestWrapper>
          <SearchBox />
          <Status />
        </InstantSearchHooksTestWrapper>
      );

      const { getByTestId } = render(<App />);

      expect(getByTestId('status')).toHaveTextContent('idle');
    });

    test('turns to loading and idle when searching', async () => {
      const App = () => (
        <InstantSearchHooksTestWrapper
          searchClient={createDelayedSearchClient(20)}
        >
          <SearchBox placeholder="search here" />
          <Status />
        </InstantSearchHooksTestWrapper>
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
        <InstantSearchHooksTestWrapper
          searchClient={createDelayedSearchClient(300)}
          stalledSearchDelay={200}
        >
          <SearchBox placeholder="search here" />
          <Status />
        </InstantSearchHooksTestWrapper>
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
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <SearchBox placeholder="search here" />
          {/* has catchError, as the real error can not be asserted upon */}
          <Status catchError />
        </InstantSearchHooksTestWrapper>
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
