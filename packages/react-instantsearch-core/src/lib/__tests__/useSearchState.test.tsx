/**
 * @jest-environment jsdom
 */

import {
  createInstantSearchTestWrapper,
  InstantSearchTestWrapper,
} from '@instantsearch/testutils';
import { render, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { useSearchBox } from '../../connectors/useSearchBox';
import { useSearchState } from '../useSearchState';

function SearchBox() {
  const { query } = useSearchBox({});
  return <>{query}</>;
}

describe('useSearchState', () => {
  test('returns the ui state', () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, rerender } = renderHook(() => useSearchState(), {
      wrapper,
    });

    expect(result.current).toEqual({
      uiState: {
        indexName: {},
      },
      indexUiState: {},
      setUiState: expect.any(Function),
      setIndexUiState: expect.any(Function),
      renderState: expect.any(Object),
      indexRenderState: expect.any(Object),
    });

    const setUiState = result.current.setUiState;
    const setIndexUiState = result.current.setIndexUiState;

    rerender();

    expect(result.current).toEqual({
      uiState: {
        indexName: {},
      },
      indexUiState: {},
      setUiState,
      setIndexUiState,
      renderState: expect.any(Object),
      indexRenderState: expect.any(Object),
    });
  });

  test('returns the ui state with initial state', () => {
    const wrapper = createInstantSearchTestWrapper({
      initialUiState: {
        indexName: {
          query: 'iphone',
        },
      },
    });
    const { result } = renderHook(() => useSearchState(), { wrapper });

    expect(result.current).toEqual({
      uiState: {
        indexName: { query: 'iphone' },
      },
      indexUiState: { query: 'iphone' },
      setUiState: expect.any(Function),
      setIndexUiState: expect.any(Function),
      renderState: expect.any(Object),
      indexRenderState: expect.any(Object),
    });
  });

  test('returns a function to modify the whole state', async () => {
    function App() {
      const { uiState, setUiState } = useSearchState();

      return (
        <>
          <button
            type="button"
            onClick={() => {
              setUiState({ indexName: { query: 'new query' } });
            }}
          >
            {uiState.indexName.query}
          </button>
          <pre data-testid="uiState">{JSON.stringify(uiState)}</pre>
          <SearchBox />
        </>
      );
    }

    const { getByRole, getByTestId } = render(
      <InstantSearchTestWrapper>
        <App />
      </InstantSearchTestWrapper>
    );
    const button = getByRole('button');
    const uiState = getByTestId('uiState');

    await waitFor(() => {
      expect(button).toHaveTextContent('');
      expect(uiState).toHaveTextContent(JSON.stringify({}));
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent('new query');
      expect(uiState).toHaveTextContent(
        JSON.stringify({ indexName: { query: 'new query' } })
      );
    });
  });

  test('returns a function to modify the whole state via callback', async () => {
    function App() {
      const { uiState, setUiState } = useSearchState();

      return (
        <>
          <button
            type="button"
            onClick={() => {
              setUiState((previous) => ({
                ...previous,
                indexName: {
                  ...previous.indexName,
                  query: `${previous.indexName.query} added`,
                },
              }));
            }}
          >
            {uiState.indexName.query}
          </button>
          <pre data-testid="uiState">{JSON.stringify(uiState)}</pre>
          <SearchBox />
        </>
      );
    }

    const { getByRole, getByTestId } = render(
      <InstantSearchTestWrapper>
        <App />
      </InstantSearchTestWrapper>
    );
    const button = getByRole('button');
    const uiState = getByTestId('uiState');

    await waitFor(() => {
      expect(button).toHaveTextContent('');
      expect(uiState).toHaveTextContent(JSON.stringify({}));
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent('undefined added');
      expect(uiState).toHaveTextContent(
        JSON.stringify({ indexName: { query: 'undefined added' } })
      );
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent('undefined added added');
      expect(uiState).toHaveTextContent(
        JSON.stringify({ indexName: { query: 'undefined added added' } })
      );
    });
  });

  test('returns a function to modify the index state', async () => {
    function App() {
      const { indexUiState, setIndexUiState } = useSearchState();

      return (
        <>
          <button
            type="button"
            onClick={() => {
              setIndexUiState({ query: 'new query' });
            }}
          >
            {indexUiState.query}
          </button>
          <pre data-testid="indexUiState">{JSON.stringify(indexUiState)}</pre>
          <SearchBox />
        </>
      );
    }

    const { getByRole, getByTestId } = render(
      <InstantSearchTestWrapper>
        <App />
      </InstantSearchTestWrapper>
    );
    const button = getByRole('button');
    const indexUiState = getByTestId('indexUiState');

    await waitFor(() => {
      expect(button).toHaveTextContent('');
      expect(indexUiState).toHaveTextContent(JSON.stringify({}));
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent('new query');
      expect(indexUiState).toHaveTextContent(
        JSON.stringify({ query: 'new query' })
      );
    });
  });

  test('returns a function to modify the index state via callback', async () => {
    function App() {
      const { indexUiState, setIndexUiState } = useSearchState();

      return (
        <>
          <button
            type="button"
            onClick={() => {
              setIndexUiState((previous) => ({
                ...previous,
                query: `${previous.query} added`,
              }));
            }}
          >
            {indexUiState.query}
          </button>
          <pre data-testid="indexUiState">{JSON.stringify(indexUiState)}</pre>
          <SearchBox />
        </>
      );
    }

    const { getByRole, getByTestId } = render(
      <InstantSearchTestWrapper>
        <App />
      </InstantSearchTestWrapper>
    );
    const button = getByRole('button');
    const indexUiState = getByTestId('indexUiState');

    await waitFor(() => {
      expect(button).toHaveTextContent('');
      expect(indexUiState).toHaveTextContent(JSON.stringify({}));
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent('undefined added');
      expect(indexUiState).toHaveTextContent(
        JSON.stringify({ query: 'undefined added' })
      );
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveTextContent('undefined added added');
      expect(indexUiState).toHaveTextContent(
        JSON.stringify({ query: 'undefined added added' })
      );
    });
  });

  test('returns the render state', async () => {
    function App() {
      const { renderState } = useSearchState();

      return (
        <>
          <button
            type="button"
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

    const { getByRole, getByTestId } = render(
      <InstantSearchTestWrapper>
        <App />
      </InstantSearchTestWrapper>
    );
    const button = getByRole('button');
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
      const { indexRenderState } = useSearchState();

      return (
        <>
          <button
            type="button"
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

    const { getByRole, getByTestId } = render(
      <InstantSearchTestWrapper>
        <App />
      </InstantSearchTestWrapper>
    );
    const button = getByRole('button');
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
