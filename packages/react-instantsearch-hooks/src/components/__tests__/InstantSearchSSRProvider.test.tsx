/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { history } from 'instantsearch.js/es/lib/routers';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import React, { StrictMode } from 'react';
import { Hits, RefinementList, SearchBox } from 'react-instantsearch-hooks-web';

import {
  createMultiSearchResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '../../../../../tests/mock';
import { InstantSearch } from '../InstantSearch';
import { InstantSearchSSRProvider } from '../InstantSearchSSRProvider';

import type { Hit as AlgoliaHit } from 'instantsearch.js';

function HitComponent({ hit }: { hit: AlgoliaHit }) {
  return <>{hit.objectID}</>;
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
        <StrictMode>
          <InstantSearchSSRProvider initialResults={initialResults}>
            <InstantSearch searchClient={searchClient} indexName="indexName">
              <Hits hitComponent={HitComponent} />
            </InstantSearch>
          </InstantSearchSSRProvider>
        </StrictMode>
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
        <StrictMode>
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
              <Hits hitComponent={HitComponent} />
            </InstantSearch>
          </InstantSearchSSRProvider>
        </StrictMode>
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
            `http://localhost/?indexName[query]=iphone`
          ) as unknown as Location;
        },
      }),
    };

    function App() {
      return (
        <StrictMode>
          <InstantSearchSSRProvider initialResults={initialResults}>
            <InstantSearch
              searchClient={searchClient}
              indexName="indexName"
              routing={routing}
            >
              <SearchBox />
              <Hits hitComponent={HitComponent} />
            </InstantSearch>
          </InstantSearchSSRProvider>
        </StrictMode>
      );
    }

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('searchbox')).toHaveValue('iphone');
    });
  });

  test('renders refinements from local widget state', async () => {
    const searchClient = createSearchClient({
      search: jest.fn((requests) => {
        return Promise.resolve(
          createMultiSearchResponse(
            ...requests.map(() =>
              createSingleSearchResponse({
                facets: {
                  brand: {
                    Samsung: 633,
                    Apple: 442,
                  },
                },
              })
            )
          )
        );
      }),
    });
    const initialResults = {
      indexName: {
        state: {
          facets: [],
          disjunctiveFacets: ['brand'],
          hierarchicalFacets: [],
          facetsRefinements: {},
          facetsExcludes: {},
          // gets ignored, the value is taken from the local widget state (which is not checked)
          disjunctiveFacetsRefinements: { brand: ['Apple'] },
          numericRefinements: {},
          tagRefinements: [],
          hierarchicalFacetsRefinements: {},
          index: 'indexName',
          query: '',
        },
        results: [
          {
            hits: [
              {
                name: 'Apple - MacBook Air® (Latest Model) - 13.3" Display - Intel Core i5 - 8GB Memory - 128GB Flash Storage - Silver',
                objectID: '6443034',
              },
              {
                name: 'Apple - EarPods™ with Remote and Mic - White',
                objectID: '6848136',
              },
            ],
            nbHits: 442,
            page: 0,
            nbPages: 23,
            hitsPerPage: 2,
            facets: { brand: { Apple: 442, Samsung: 633 } },
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            exhaustiveTypo: true,
            query: '',
            queryAfterRemoval: '',
            params: '',
            index: 'indexName',
            processingTimeMS: 1,
          },
          {
            hits: [
              {
                name: 'Amazon - Fire TV Stick with Alexa Voice Remote - Black',
                objectID: '5477500',
              },
            ],
            nbHits: 21469,
            page: 0,
            nbPages: 1000,
            hitsPerPage: 1,
            facets: {
              brand: { Samsung: 633, Apple: 442 },
            },
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            exhaustiveTypo: true,
            query: '',
            queryAfterRemoval: '',
            params: '',
            index: 'indexName',
            processingTimeMS: 1,
          },
        ],
      },
    };

    function App() {
      return (
        <StrictMode>
          <InstantSearchSSRProvider initialResults={initialResults}>
            <InstantSearch searchClient={searchClient} indexName="indexName">
              <RefinementList attribute="brand" />
            </InstantSearch>
          </InstantSearchSSRProvider>
        </StrictMode>
      );
    }

    const { getByRole } = render(<App />);

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(0);
      expect(getByRole('checkbox', { name: 'Apple 442' })).not.toBeChecked();
      expect(getByRole('checkbox', { name: 'Samsung 633' })).not.toBeChecked();
    });

    userEvent.click(getByRole('checkbox', { name: 'Apple 442' }));

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(getByRole('checkbox', { name: 'Apple 442' })).toBeChecked();
      expect(getByRole('checkbox', { name: 'Samsung 633' })).not.toBeChecked();
    });
  });

  test('without server state renders children', async () => {
    const searchClient = createSearchClient({});

    function App() {
      return (
        <StrictMode>
          <InstantSearchSSRProvider>
            <InstantSearch searchClient={searchClient} indexName="indexName">
              <main>
                <h1>Search</h1>
                <Hits hitComponent={HitComponent} />
              </main>
            </InstantSearch>
          </InstantSearchSSRProvider>
        </StrictMode>
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
        <StrictMode>
          <InstantSearchSSRProvider initialResults={initialResults}>
            <InstantSearch searchClient={searchClient} indexName="indexName">
              <Hits hitComponent={HitComponent} />
            </InstantSearch>
          </InstantSearchSSRProvider>
        </StrictMode>
      );
    }

    render(<App />);

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(0);
    });
  });

  test('recovers the state on rerender', async () => {
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
        <StrictMode>
          <InstantSearchSSRProvider initialResults={initialResults}>
            <InstantSearch searchClient={searchClient} indexName="indexName">
              <SearchBox />
            </InstantSearch>
          </InstantSearchSSRProvider>
        </StrictMode>
      );
    }

    const { rerender } = render(<App />);

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(0);
    });

    rerender(<App />);

    userEvent.type(screen.getByRole('searchbox'), 'iphone');

    await waitFor(() => {
      expect(searchClient.search).toHaveBeenCalledTimes(6);
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
      expect(searchClient.search).toHaveBeenCalledTimes(11);
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
});
