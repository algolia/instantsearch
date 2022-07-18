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

    await waitFor(() => {
      expect(searchContext.current!.dispose).toHaveBeenCalledTimes(1);
      expect(searchContext.current!.started).toEqual(false);
      expect(searchContext.current!.mainIndex.getWidgets()).toEqual([]);
    });
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
  // unstable prop) does not remount the <InstantSearch> component and therefore
  // keeps the state.
  // Prior to the current implementation, we created a new InstantSearch.js
  // instance at each prop change, which made this test fail.
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

  test('updates the client on client prop change', async () => {
    const searchClient1 = createSearchClient({});
    const searchClient2 = createSearchClient({});
    const searchClient3 = createSearchClient({});

    function App({ searchClient }) {
      return (
        <StrictMode>
          <InstantSearch searchClient={searchClient} indexName="indexName">
            <SearchBox />
          </InstantSearch>
        </StrictMode>
      );
    }

    const { rerender } = render(<App searchClient={searchClient1} />);

    await waitFor(() => {
      expect(searchClient1.search).toHaveBeenCalledTimes(1);
    });

    rerender(<App searchClient={searchClient2} />);

    await waitFor(() => {
      expect(searchClient1.search).toHaveBeenCalledTimes(1);
      expect(searchClient2.search).toHaveBeenCalledTimes(1);
      expect(searchClient2.addAlgoliaAgent).toHaveBeenCalledWith(
        `react (${ReactVersion})`
      );
      expect(searchClient2.addAlgoliaAgent).toHaveBeenCalledWith(
        `react-instantsearch (${version})`
      );
      expect(searchClient2.addAlgoliaAgent).toHaveBeenCalledWith(
        `react-instantsearch-hooks (${version})`
      );
    });

    rerender(<App searchClient={searchClient3} />);

    await waitFor(() => {
      expect(searchClient1.search).toHaveBeenCalledTimes(1);
      expect(searchClient2.search).toHaveBeenCalledTimes(1);
      expect(searchClient3.search).toHaveBeenCalledTimes(1);
      expect(searchClient3.addAlgoliaAgent).toHaveBeenCalledWith(
        `react (${ReactVersion})`
      );
      expect(searchClient3.addAlgoliaAgent).toHaveBeenCalledWith(
        `react-instantsearch (${version})`
      );
      expect(searchClient3.addAlgoliaAgent).toHaveBeenCalledWith(
        `react-instantsearch-hooks (${version})`
      );
    });

    userEvent.type(screen.getByRole('searchbox'), 'iphone');

    await waitFor(() => {
      expect(searchClient3.search).toHaveBeenCalledTimes(7);
      expect(searchClient3.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName',
          params: expect.objectContaining({
            query: 'iphone',
          }),
        },
      ]);
    });
  });

  test('updates the index on index prop change', async () => {
    const searchClient = createSearchClient({});

    function App({ indexName }) {
      return (
        <StrictMode>
          <InstantSearch searchClient={searchClient} indexName={indexName}>
            <SearchBox />
          </InstantSearch>
        </StrictMode>
      );
    }

    const { rerender } = render(<App indexName="indexName1" />);

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        expect.objectContaining({
          indexName: 'indexName1',
        }),
      ]);
    });

    expect(searchClient.search).toHaveBeenCalledTimes(1);

    rerender(<App indexName="indexName2" />);

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        expect.objectContaining({
          indexName: 'indexName2',
        }),
      ]);
    });

    rerender(<App indexName="indexName3" />);

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(3);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        expect.objectContaining({
          indexName: 'indexName3',
        }),
      ]);
    });

    userEvent.type(screen.getByRole('searchbox'), 'iphone');

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(9);
      expect(searchClient.search).toHaveBeenLastCalledWith([
        {
          indexName: 'indexName3',
          params: expect.objectContaining({
            query: 'iphone',
          }),
        },
      ]);
    });
  });

  test('updates onStateChange on onStateChange prop change', async () => {
    const searchClient = createSearchClient({});
    const onStateChange1 = jest.fn(({ uiState, setUiState }) => {
      setUiState(uiState);
    });
    const onStateChange2 = jest.fn(({ uiState, setUiState }) => {
      setUiState(uiState);
    });

    function App({ onStateChange }) {
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

    const { rerender } = render(<App onStateChange={onStateChange1} />);

    userEvent.type(screen.getByRole('searchbox'), 'iphone');

    await waitFor(() => {
      expect(onStateChange1).toHaveBeenCalledTimes(6);
    });

    rerender(<App onStateChange={onStateChange2} />);

    userEvent.type(screen.getByRole('searchbox'), ' case', {
      initialSelectionStart: 6,
    });

    await waitFor(() => {
      expect(onStateChange1).toHaveBeenCalledTimes(6);
      expect(onStateChange2).toHaveBeenCalledTimes(5);
    });

    rerender(<App onStateChange={undefined} />);

    userEvent.type(screen.getByRole('searchbox'), ' red', {
      initialSelectionStart: 11,
    });

    await waitFor(() => {
      expect(onStateChange1).toHaveBeenCalledTimes(6);
      expect(onStateChange2).toHaveBeenCalledTimes(5);
    });
  });

  test('updates searchFunction on searchFunction prop change', async () => {
    const searchClient = createSearchClient({});
    const searchFunction1 = jest.fn((helper) => {
      helper.search();
    });
    const searchFunction2 = jest.fn((helper) => {
      helper.search();
    });

    function App({ searchFunction }) {
      return (
        <StrictMode>
          <InstantSearch
            searchClient={searchClient}
            indexName="indexName"
            searchFunction={searchFunction}
          >
            <SearchBox />
          </InstantSearch>
        </StrictMode>
      );
    }

    const { rerender } = render(<App searchFunction={searchFunction1} />);

    await waitFor(() => {
      expect(searchFunction1).toHaveBeenCalledTimes(1);
    });

    userEvent.type(screen.getByRole('searchbox'), 'iphone');

    await waitFor(() => {
      expect(searchFunction1).toHaveBeenCalledTimes(7);
    });

    rerender(<App searchFunction={searchFunction2} />);

    userEvent.type(screen.getByRole('searchbox'), ' case', {
      initialSelectionStart: 6,
    });

    await waitFor(() => {
      expect(searchFunction1).toHaveBeenCalledTimes(7);
      expect(searchFunction2).toHaveBeenCalledTimes(5);
    });
  });
});
