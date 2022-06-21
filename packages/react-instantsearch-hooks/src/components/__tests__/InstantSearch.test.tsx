import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { history } from 'instantsearch.js/es/lib/routers';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import React, { StrictMode, Suspense, version as ReactVersion } from 'react';
import { SearchBox } from 'react-instantsearch-hooks-web';

import { createSearchClient } from '../../../../../test/mock';
import { createInstantSearchSpy } from '../../../../../test/utils';
import { useRefinementList } from '../../connectors/useRefinementList';
import version from '../../version';
import { Index } from '../Index';
import { InstantSearch } from '../InstantSearch';

import type { UseRefinementListProps } from '../../connectors/useRefinementList';

function RefinementList(props: UseRefinementListProps) {
  useRefinementList(props);
  return null;
}

describe('InstantSearch', () => {
  test('renders children', () => {
    const searchClient = createSearchClient({});

    const { container } = render(
      <StrictMode>
        <InstantSearch indexName="indexName" searchClient={searchClient}>
          Children
        </InstantSearch>
      </StrictMode>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        Children
      </div>
    `);
  });

  test('provides the search instance', () => {
    const searchClient = createSearchClient({});
    const { InstantSearchSpy, searchContext } = createInstantSearchSpy();

    render(
      <StrictMode>
        <InstantSearchSpy indexName="indexName" searchClient={searchClient} />
      </StrictMode>
    );

    expect(searchContext.current).toEqual(
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
    const { InstantSearchSpy, indexContext } = createInstantSearchSpy();

    render(
      <StrictMode>
        <InstantSearchSpy indexName="indexName" searchClient={searchClient} />
      </StrictMode>
    );

    expect(indexContext.current).toEqual(
      expect.objectContaining({
        $$type: 'ais.index',
        addWidgets: expect.any(Function),
        removeWidgets: expect.any(Function),
      })
    );
  });

  test('attaches users agents', () => {
    const searchClient = createSearchClient({});

    render(
      <StrictMode>
        <InstantSearch indexName="indexName" searchClient={searchClient} />
      </StrictMode>
    );

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

  test('starts the search on mount', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchSpy, searchContext } = createInstantSearchSpy();

    render(
      <StrictMode>
        <InstantSearchSpy indexName="indexName" searchClient={searchClient} />
      </StrictMode>
    );

    expect(searchContext.current!.started).toEqual(true);

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(0));
  });

  test('starts the search on mount with a widget and triggers a search', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchSpy, searchContext } = createInstantSearchSpy();

    render(
      <StrictMode>
        <InstantSearchSpy indexName="indexName" searchClient={searchClient}>
          <SearchBox />
        </InstantSearchSpy>
      </StrictMode>
    );

    expect(searchContext.current!.started).toEqual(true);

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));
  });

  test('disposes the search on unmount', async () => {
    const searchClient = createSearchClient({});
    const { InstantSearchSpy, searchContext } = createInstantSearchSpy();

    const { unmount } = render(
      <StrictMode>
        <InstantSearchSpy indexName="indexName" searchClient={searchClient}>
          <SearchBox />
        </InstantSearchSpy>
      </StrictMode>
    );

    expect(searchContext.current!.started).toEqual(true);

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    unmount();

    expect(searchContext.current!.dispose).toHaveBeenCalledTimes(1);
    expect(searchContext.current!.started).toEqual(false);
  });

  test('triggers a single network request on mount with widgets', async () => {
    const searchClient = createSearchClient({});

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

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(searchClient.search).toHaveBeenLastCalledWith([
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

  test('renders components within a Suspense boundary', async () => {
    const searchClient = createSearchClient({});

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

    await waitFor(() => expect(searchClient.search).toHaveBeenCalledTimes(1));

    expect(searchClient.search).toHaveBeenLastCalledWith([
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

  test('renders with router state', async () => {
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

  test('renders with router state from unstable routing', async () => {
    const searchClient = createSearchClient({});

    function App({ url }) {
      const routing = {
        stateMapping: simple(),
        router: history({
          getLocation() {
            return new URL(url) as unknown as Location;
          },
        }),
      };

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

    const { rerender } = render(
      <App url="http://localhost/?indexName[query]=iphone" />
    );

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

    rerender(<App url="http://localhost/?indexName[query]=iphone" />);

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

  test('recovers the state on rerender', async () => {
    const searchClient = createSearchClient({});

    function App() {
      return (
        <StrictMode>
          <InstantSearch searchClient={searchClient} indexName="indexName">
            <SearchBox />
          </InstantSearch>
        </StrictMode>
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

  test('recovers the state on rerender with a stable onStateChange', async () => {
    const searchClient = createSearchClient({});
    const onStateChange = ({ uiState, setUiState }) => {
      setUiState(uiState);
    };

    function App() {
      return (
        <StrictMode>
          <InstantSearch
            searchClient={searchClient}
            indexName="indexName"
            onStateChange={onStateChange}
          >
            <SearchBox />
          </InstantSearch>
        </StrictMode>
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
  // Users need to provide stable references for rerenders to keep the state.
  test('recovers the state on rerender with an unstable onStateChange', async () => {
    const searchClient = createSearchClient({});

    function App() {
      return (
        <StrictMode>
          <InstantSearch
            searchClient={searchClient}
            indexName="indexName"
            onStateChange={({ uiState, setUiState }) => {
              setUiState(uiState);
            }}
          >
            <SearchBox />
          </InstantSearch>
        </StrictMode>
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
