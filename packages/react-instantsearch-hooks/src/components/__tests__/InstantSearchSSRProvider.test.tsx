import { render, screen, waitFor } from '@testing-library/react';
import { history } from 'instantsearch.js/es/lib/routers';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import React from 'react';
import { Hits, SearchBox } from 'react-instantsearch-hooks-web';

import { createSearchClient } from '../../../../../test/mock';
import { wait } from '../../../../../test/utils';
import { InstantSearch } from '../InstantSearch';
import { InstantSearchSSRProvider } from '../InstantSearchSSRProvider';

function Hit({ hit }) {
  return hit.objectID;
}

describe('InstantSearchSSRProvider', () => {
  test('provides initialResults to InstantSearch', async () => {
    const searchClient = createSearchClient({});
    const initialResults = {
      indexName: {
        state: {},
        results: [
          {
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            hits: [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }],
            hitsPerPage: 20,
            index: 'indexName',
            nbHits: 0,
            nbPages: 0,
            page: 0,
            params: '',
            processingTimeMS: 0,
            query: '',
          },
        ],
      },
    };

    function App() {
      return (
        <InstantSearchSSRProvider initialResults={initialResults}>
          <InstantSearch searchClient={searchClient} indexName="indexName">
            <Hits hitComponent={Hit} />
          </InstantSearch>
        </InstantSearchSSRProvider>
      );
    }

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('list')).toMatchInlineSnapshot(`
        <ol
          class="ais-Hits-list"
        >
          <li
            class="ais-Hits-item"
          >
            1
          </li>
          <li
            class="ais-Hits-item"
          >
            2
          </li>
          <li
            class="ais-Hits-item"
          >
            3
          </li>
        </ol>
      `);
    });
  });

  test('renders initial results state with initialUiState', async () => {
    const searchClient = createSearchClient({});
    const initialResults = {
      indexName: {
        state: { query: 'iphone' },
        results: [
          {
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            hits: [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }],
            hitsPerPage: 20,
            index: 'indexName',
            nbHits: 0,
            nbPages: 0,
            page: 0,
            params: '',
            processingTimeMS: 0,
            query: '',
          },
        ],
      },
    };

    function App() {
      return (
        <InstantSearchSSRProvider initialResults={initialResults}>
          <InstantSearch
            searchClient={searchClient}
            indexName="indexName"
            initialUiState={{
              indexName: {
                query: 'iphone',
              },
            }}
          >
            <SearchBox />
            <Hits hitComponent={Hit} />
          </InstantSearch>
        </InstantSearchSSRProvider>
      );
    }

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('searchbox')).toHaveValue('iphone');
    });
  });

  test('renders initial results state with router', async () => {
    const searchClient = createSearchClient({});
    const initialResults = {
      indexName: {
        state: { query: 'iphone' },
        results: [
          {
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            hits: [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }],
            hitsPerPage: 20,
            index: 'indexName',
            nbHits: 0,
            nbPages: 0,
            page: 0,
            params: '',
            processingTimeMS: 0,
            query: '',
          },
        ],
      },
    };
    const routing = {
      stateMapping: simple(),
      router: history({
        getLocation() {
          return new URL(
            `https://website.com/?indexName[query]=iphone`
          ) as unknown as Location;
        },
      }),
    };

    function App() {
      return (
        <InstantSearchSSRProvider initialResults={initialResults}>
          <InstantSearch
            searchClient={searchClient}
            indexName="indexName"
            routing={routing}
          >
            <SearchBox />
            <Hits hitComponent={Hit} />
          </InstantSearch>
        </InstantSearchSSRProvider>
      );
    }

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('searchbox')).toHaveValue('iphone');
    });
  });

  test('without server state renders children', async () => {
    const searchClient = createSearchClient({});

    function App() {
      return (
        <InstantSearchSSRProvider>
          <InstantSearch searchClient={searchClient} indexName="indexName">
            <main>
              <h1>Search</h1>
              <Hits hitComponent={Hit} />
            </main>
          </InstantSearch>
        </InstantSearchSSRProvider>
      );
    }

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('main')).toMatchInlineSnapshot(`
        <main>
          <h1>
            Search
          </h1>
          <div
            class="ais-Hits ais-Hits--empty"
          >
            <ol
              class="ais-Hits-list"
            />
          </div>
        </main>
      `);
    });
  });

  test('does not trigger a network request with initialResults', async () => {
    const searchClient = createSearchClient({});
    const initialResults = {
      indexName: {
        state: {},
        results: [
          {
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            hits: [{ objectID: '1' }, { objectID: '2' }, { objectID: '3' }],
            hitsPerPage: 20,
            index: 'indexName',
            nbHits: 0,
            nbPages: 0,
            page: 0,
            params: '',
            processingTimeMS: 0,
            query: '',
          },
        ],
      },
    };

    function App() {
      return (
        <InstantSearchSSRProvider initialResults={initialResults}>
          <InstantSearch searchClient={searchClient} indexName="indexName">
            <Hits hitComponent={Hit} />
          </InstantSearch>
        </InstantSearchSSRProvider>
      );
    }

    render(<App />);

    await wait(0);

    expect(searchClient.search).toHaveBeenCalledTimes(0);
  });
});
