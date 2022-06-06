import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { history } from 'instantsearch.js/es/lib/routers';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import React, { StrictMode, Suspense, version as ReactVersion } from 'react';
import { SearchBox } from 'react-instantsearch-hooks-web';

import { createSearchClient } from '../../../../../test/mock';
import { wait } from '../../../../../test/utils';
import { useRefinementList } from '../../connectors/useRefinementList';
import { IndexContext } from '../../lib/IndexContext';
import { InstantSearchContext } from '../../lib/InstantSearchContext';
import version from '../../version';
import { Index } from '../Index';
import { InstantSearch } from '../InstantSearch';

import type { UseRefinementListProps } from '../../connectors/useRefinementList';
import type { InstantSearch as InstantSearchType } from 'instantsearch.js';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';

function RefinementList(props: UseRefinementListProps) {
  useRefinementList(props);
  return null;
}

describe('InstantSearch', () => {
  test('renders children', () => {
    const searchClient = createSearchClient({});

    const { container } = render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        Children
      </InstantSearch>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        Children
      </div>
    `);
  });

  test('provides the search instance', () => {
    const searchClient = createSearchClient({});
    let searchContext: InstantSearchType | null = null;

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <InstantSearchContext.Consumer>
          {(context) => {
            searchContext = context;
            return null;
          }}
        </InstantSearchContext.Consumer>
      </InstantSearch>
    );

    expect(searchContext).toEqual(
      expect.objectContaining({
        start: expect.any(Function),
        dispose: expect.any(Function),
        addWidgets: expect.any(Function),
        removeWidgets: expect.any(Function),
      })
    );
  });

  test('provides the main index', () => {
    const searchClient = createSearchClient({});
    let indexContext: IndexWidget | null = null;

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <IndexContext.Consumer>
          {(context) => {
            indexContext = context;
            return null;
          }}
        </IndexContext.Consumer>
      </InstantSearch>
    );

    expect(indexContext).toEqual(
      expect.objectContaining({
        $$type: 'ais.index',
        addWidgets: expect.any(Function),
        removeWidgets: expect.any(Function),
      })
    );
  });

  test('attaches users agents', () => {
    const searchClient = createSearchClient({});

    render(<InstantSearch indexName="indexName" searchClient={searchClient} />);

    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react (${ReactVersion})`
    );
    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react-instantsearch (${version})`
    );
    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react-instantsearch-hooks (${version})`
    );
  });

  test('starts the search on mount', () => {
    const searchClient = createSearchClient({});
    let searchContext: InstantSearchType | null = null;

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <InstantSearchContext.Consumer>
          {(context) => {
            searchContext = context;
            return null;
          }}
        </InstantSearchContext.Consumer>
      </InstantSearch>
    );

    expect(searchContext!.started).toEqual(true);
  });

  test('disposes the search on unmount', () => {
    const searchClient = createSearchClient({});
    let searchContext: InstantSearchType | null = null;

    const { unmount } = render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <InstantSearchContext.Consumer>
          {(context) => {
            searchContext = context;
            return null;
          }}
        </InstantSearchContext.Consumer>
      </InstantSearch>
    );

    unmount();

    expect(searchContext!.started).toEqual(false);
  });

  test('triggers a single network request on mount with widgets', async () => {
    const searchClient = createSearchClient({});

    render(
      <InstantSearch indexName="indexName" searchClient={searchClient}>
        <SearchBox />
        <Index indexName="subIndexName">
          <RefinementList attribute="brand" />
        </Index>
      </InstantSearch>
    );

    await wait(0);

    expect(searchClient.search).toHaveBeenCalledTimes(1);
  });

  test('renders components in Strict Mode', async () => {
    const searchClient = createSearchClient({});

    act(() => {
      render(
        <StrictMode>
          <InstantSearch indexName="indexName" searchClient={searchClient}>
            <SearchBox />
            <Index indexName="subIndexName">
              <RefinementList attribute="brand" />
            </Index>
          </InstantSearch>
        </StrictMode>
      );
    });

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: { facets: [], query: '', tagFilters: '' },
        },
        {
          indexName: 'subIndexName',
          params: {
            facets: ['brand'],
            maxValuesPerFacet: 10,
            query: '',
            tagFilters: '',
          },
        },
      ]);
    });
  });

  test('renders components in Strict Mode with a Suspense boundary', async () => {
    const searchClient = createSearchClient({});

    act(() => {
      render(
        <StrictMode>
          <InstantSearch indexName="indexName" searchClient={searchClient}>
            <SearchBox />
            <Suspense fallback={null}>
              <Index indexName="subIndexName">
                <RefinementList attribute="brand" />
              </Index>
            </Suspense>
          </InstantSearch>
        </StrictMode>
      );
    });

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: { facets: [], query: '', tagFilters: '' },
        },
        {
          indexName: 'subIndexName',
          params: {
            facets: ['brand'],
            maxValuesPerFacet: 10,
            query: '',
            tagFilters: '',
          },
        },
      ]);
    });
  });

  test('renders with state from router in Strict Mode', async () => {
    const searchClient = createSearchClient({});
    const routing = {
      stateMapping: simple(),
      router: history({
        getLocation() {
          return new URL(
            `http://localhost/?indexName[query]=iphone`
          ) as unknown as Location;
        },
      }),
    };

    function App() {
      return (
        <StrictMode>
          <InstantSearch
            searchClient={searchClient}
            indexName="indexName"
            routing={routing}
          >
            <SearchBox />
          </InstantSearch>
        </StrictMode>
      );
    }

    const { rerender } = render(<App />);

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({ query: 'iphone' }),
        },
      ]);
      expect(screen.getByRole('searchbox')).toHaveValue('iphone');
    });

    rerender(<App />);

    expect(screen.getByRole('searchbox')).toHaveValue('iphone');

    userEvent.type(screen.getByRole('searchbox'), ' case', {
      initialSelectionStart: 6,
    });

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(6);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({ query: 'iphone case' }),
        },
      ]);
      expect(screen.getByRole('searchbox')).toHaveValue('iphone case');
    });
  });

  test('renders components with a Suspense boundary', async () => {
    const searchClient = createSearchClient({});

    act(() => {
      render(
        <InstantSearch indexName="indexName" searchClient={searchClient}>
          <SearchBox />
          <Suspense fallback={null}>
            <Index indexName="subIndexName">
              <RefinementList attribute="brand" />
            </Index>
          </Suspense>
        </InstantSearch>
      );
    });

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenCalledWith([
        {
          indexName: 'indexName',
          params: { facets: [], query: '', tagFilters: '' },
        },
        {
          indexName: 'subIndexName',
          params: {
            facets: ['brand'],
            maxValuesPerFacet: 10,
            query: '',
            tagFilters: '',
          },
        },
      ]);
    });
  });

  test('catches up with lifecycle on re-renders', async () => {
    const searchClient = createSearchClient({});

    function App() {
      return (
        <InstantSearch searchClient={searchClient} indexName="indexName">
          <SearchBox />
        </InstantSearch>
      );
    }

    const { rerender } = render(<App />);

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    userEvent.type(screen.getByRole('searchbox'), 'iphone');

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(7);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({
            query: 'iphone',
          }),
        },
      ]);
    });

    rerender(<App />);

    userEvent.type(screen.getByRole('searchbox'), ' case', {
      initialSelectionStart: 6,
    });

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(12);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({
            query: 'iphone case',
          }),
        },
      ]);
    });
  });

  test('catches up with lifecycle on re-renders with a stable onStateChange', async () => {
    const searchClient = createSearchClient({});
    const onStateChange = ({ uiState, setUiState }) => {
      setUiState(uiState);
    };

    function App() {
      return (
        <InstantSearch
          searchClient={searchClient}
          indexName="indexName"
          onStateChange={onStateChange}
        >
          <SearchBox />
        </InstantSearch>
      );
    }

    const { rerender } = render(<App />);

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    userEvent.type(screen.getByRole('searchbox'), 'iphone');

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({
            query: 'iphone',
          }),
        },
      ]);
    });

    rerender(<App />);

    userEvent.type(screen.getByRole('searchbox'), ' case', {
      initialSelectionStart: 6,
    });

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(3);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({
            query: 'iphone case',
          }),
        },
      ]);
    });
  });

  // This test shows that giving an unstable `onStateChange` reference (or any
  // unstable prop) remounts the <InstantSearch> component and therefore resets
  // the state after the remount.
  // Users need to provide stable references for re-renders to keep the state.
  test('catches up with lifecycle on re-renders with an unstable onStateChange', async () => {
    const searchClient = createSearchClient({});

    function App() {
      return (
        <InstantSearch
          searchClient={searchClient}
          indexName="indexName"
          onStateChange={({ uiState, setUiState }) => {
            setUiState(uiState);
          }}
        >
          <SearchBox />
        </InstantSearch>
      );
    }

    const { rerender } = render(<App />);

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    userEvent.type(screen.getByRole('searchbox'), 'iphone');

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({
            query: 'iphone',
          }),
        },
      ]);
    });

    // After this rerender, the UI state is reset to the initial state because
    // the `onStateChange` reference has changed.
    rerender(<App />);

    userEvent.type(screen.getByRole('searchbox'), ' case', {
      initialSelectionStart: 6,
    });

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(3);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({
            // The query was reset because of the remount
            query: ' case',
          }),
        },
      ]);
    });
  });
});
