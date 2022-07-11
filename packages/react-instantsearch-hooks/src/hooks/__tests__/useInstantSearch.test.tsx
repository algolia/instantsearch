import { render, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import { AlgoliaSearchHelper, SearchResults } from 'algoliasearch-helper';
import React, { useEffect } from 'react';
import { SearchBox } from 'react-instantsearch-hooks-web';

import { createSearchClient } from '../../../../../test/mock';
import {
  createInstantSearchTestWrapper,
  InstantSearchHooksTestWrapper,
} from '../../../../../test/utils';
import { useInstantSearch } from '../useInstantSearch';

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
    test('gives access to the use function', async () => {
      const subscribe = jest.fn();
      const onStateChange = jest.fn();
      const unsubscribe = jest.fn();
      const middleware = jest.fn(() => ({
        subscribe,
        onStateChange,
        unsubscribe,
      }));

      function Middleware() {
        const { use } = useInstantSearch();
        useEffect(() => use(middleware), [use]);

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
      // unsubscribe is first called by the parent InstantSearch unmounting
      // 🚨 dispose doesn't remove middleware (because otherwise routing would break)
      // then unuse is called by this widget itself unmounting.
      // if only the component with useInstantSearch is unmounted, unsubscribe is called once.
      // This is a problem in InstantSearch.js and will be fixed there.
      expect(unsubscribe).toHaveBeenCalledTimes(2);
    });

    test('provides a stable reference', () => {
      const wrapper = createInstantSearchTestWrapper();
      const { result, rerender } = renderHook(() => useInstantSearch(), {
        wrapper,
      });

      expect(result.current.use).toBeInstanceOf(Function);

      const ref = result.current.use;

      rerender();

      expect(result.current.use).toBe(ref);
    });
  });

  describe('refresh', () => {
    test('refreshes the search', async () => {
      const searchClient = createSearchClient({});
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
});
