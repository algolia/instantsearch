import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  InstantSearchHooksTestWrapper,
  wait,
  createInstantSearchTestWrapper,
} from '../../../../../test/utils';
import { useSearchBox } from '../../connectors/useSearchBox';
import { useSearchState } from '../useSearchState';

function SearchBox() {
  const { query } = useSearchBox({});
  return <>{query}</>;
}

describe('useSearchState', () => {
  test('returns the ui state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(() => useSearchState(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      uiState: {
        indexName: {},
      },
      indexUiState: {},
      setUiState: expect.any(Function),
      setIndexUiState: expect.any(Function),
    });

    const setUiState = result.current.setUiState;
    const setIndexUiState = result.current.setIndexUiState;

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      uiState: {
        indexName: {},
      },
      indexUiState: {},
      setUiState,
      setIndexUiState,
    });
  });

  test('returns the ui state with initial state', async () => {
    const wrapper = createInstantSearchTestWrapper({
      initialUiState: {
        indexName: {
          query: 'iphone',
        },
      },
    });
    const { result, waitForNextUpdate } = renderHook(() => useSearchState(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      uiState: {
        indexName: { query: 'iphone' },
      },
      indexUiState: { query: 'iphone' },
      setUiState: expect.any(Function),
      setIndexUiState: expect.any(Function),
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      uiState: {
        indexName: { query: 'iphone' },
      },
      indexUiState: { query: 'iphone' },
      setUiState: expect.any(Function),
      setIndexUiState: expect.any(Function),
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
      <InstantSearchHooksTestWrapper>
        <App />
      </InstantSearchHooksTestWrapper>
    );
    const button = getByRole('button');
    const uiState = getByTestId('uiState');

    await wait(0);

    expect(button).toHaveTextContent('');
    expect(uiState).toHaveTextContent(JSON.stringify({}));

    userEvent.click(button);

    await wait(0);

    expect(button).toHaveTextContent('new query');
    expect(uiState).toHaveTextContent(
      JSON.stringify({ indexName: { query: 'new query' } })
    );
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
      <InstantSearchHooksTestWrapper>
        <App />
      </InstantSearchHooksTestWrapper>
    );
    const button = getByRole('button');
    const uiState = getByTestId('uiState');

    await wait(0);

    expect(button).toHaveTextContent('');
    expect(uiState).toHaveTextContent(JSON.stringify({}));

    userEvent.click(button);

    await wait(0);

    expect(button).toHaveTextContent('undefined added');
    expect(uiState).toHaveTextContent(
      JSON.stringify({ indexName: { query: 'undefined added' } })
    );

    userEvent.click(button);

    await wait(0);

    expect(button).toHaveTextContent('undefined added added');
    expect(uiState).toHaveTextContent(
      JSON.stringify({ indexName: { query: 'undefined added added' } })
    );
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
      <InstantSearchHooksTestWrapper>
        <App />
      </InstantSearchHooksTestWrapper>
    );
    const button = getByRole('button');
    const indexUiState = getByTestId('indexUiState');

    await wait(0);

    expect(button).toHaveTextContent('');
    expect(indexUiState).toHaveTextContent(JSON.stringify({}));

    userEvent.click(button);

    await wait(0);

    expect(button).toHaveTextContent('new query');
    expect(indexUiState).toHaveTextContent(
      JSON.stringify({ query: 'new query' })
    );
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
      <InstantSearchHooksTestWrapper>
        <App />
      </InstantSearchHooksTestWrapper>
    );
    const button = getByRole('button');
    const indexUiState = getByTestId('indexUiState');

    await wait(0);

    expect(button).toHaveTextContent('');
    expect(indexUiState).toHaveTextContent(JSON.stringify({}));

    userEvent.click(button);

    await wait(0);

    expect(button).toHaveTextContent('undefined added');
    expect(indexUiState).toHaveTextContent(
      JSON.stringify({ query: 'undefined added' })
    );

    userEvent.click(button);

    await wait(0);

    expect(button).toHaveTextContent('undefined added added');
    expect(indexUiState).toHaveTextContent(
      JSON.stringify({ query: 'undefined added added' })
    );
  });
});
