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
    test('gives access to results', async () => {
      const wrapper = createInstantSearchTestWrapper();
      const { result, waitForNextUpdate } = renderHook(
        () => useInstantSearch(),
        { wrapper }
      );

      // Initial render state from manual `getWidgetRenderState`
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

      await waitForNextUpdate();

      // InstantSearch.js state from the `render` lifecycle step
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
    test('returns the ui state', async () => {
      const wrapper = createInstantSearchTestWrapper();
      const { result, waitForNextUpdate } = renderHook(
        () => useInstantSearch(),
        { wrapper }
      );

      // Initial render state from manual `getWidgetRenderState`
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

      const setUiState = result.current.setUiState;
      const setIndexUiState = result.current.setIndexUiState;

      await waitForNextUpdate();

      // InstantSearch.js state from the `render` lifecycle step
      expect(result.current).toEqual(
        expect.objectContaining({
          uiState: {
            indexName: {},
          },
          indexUiState: {},
          setUiState,
          setIndexUiState,
        })
      );
    });

    test('returns the ui state with initial state', async () => {
      const wrapper = createInstantSearchTestWrapper({
        initialUiState: {
          indexName: {
            query: 'iphone',
          },
        },
      });
      const { result, waitForNextUpdate } = renderHook(
        () => useInstantSearch(),
        { wrapper }
      );

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

      await waitForNextUpdate();

      // InstantSearch.js state from the `render` lifecycle step
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
  });

  describe('refresh', () => {
    test('refreshes the search', async () => {
      const searchClient = createSearchClient({});
      function App() {
        const { refresh } = useInstantSearch();

        return (
          <>
            <button
              type="button"
              onClick={() => {
                refresh();
              }}
            >
              refresh
            </button>
          </>
        );
      }

      const { container } = render(
        <InstantSearchHooksTestWrapper searchClient={searchClient}>
          <App />
        </InstantSearchHooksTestWrapper>
      );

      await waitFor(() => {
        expect(searchClient.search).toHaveBeenCalledTimes(1);
      });

      userEvent.click(container.querySelector('button')!);

      expect(searchClient.search).toHaveBeenCalledTimes(2);
    });

    test('provides a stable reference', async () => {
      const wrapper = createInstantSearchTestWrapper();
      const { result, waitForNextUpdate, rerender } = renderHook(
        () => useInstantSearch(),
        { wrapper }
      );

      expect(result.current.refresh).toBeInstanceOf(Function);

      const ref = result.current.refresh;

      await waitForNextUpdate();

      // reference has not changed
      expect(result.current.refresh).toBe(ref);

      rerender();

      // reference has not changed
      expect(result.current.refresh).toBe(ref);
    });
  });
});
