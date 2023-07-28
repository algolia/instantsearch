/**
 * @jest-environment node
 */

import {
  createMultiSearchResponse,
  createSearchClient,
  createAlgoliaSearchClient,
  createSingleSearchResponse,
  defaultRenderingContent,
} from '@instantsearch/mocks';
import React, { version as ReactVersion } from 'react';
import { renderToString } from 'react-dom/server';
import {
  InstantSearch,
  InstantSearchSSRProvider,
  Index,
  DynamicWidgets,
  version,
  useSearchBox,
} from 'react-instantsearch-hooks';
import { Hits, RefinementList } from 'react-instantsearch-hooks-web';

import { getServerState } from '../getServerState';

import type { MockSearchClient } from '@instantsearch/mocks';
import type { Hit as AlgoliaHit } from 'instantsearch.js';
import type {
  InstantSearchServerState,
  InstantSearchProps,
} from 'react-instantsearch-hooks';

function SearchBox() {
  const { query } = useSearchBox();

  return (
    <div className="ais-SearchBox">
      <form action="" className="ais-SearchBox-form" noValidate>
        <input className="ais-SearchBox-input" defaultValue={query} />
      </form>
    </div>
  );
}

function Hit({ hit }: { hit: AlgoliaHit }) {
  return <>{hit.objectID}</>;
}

type CreateTestEnvironmentProps = {
  searchClient: InstantSearchProps['searchClient'];
  initialUiState?: InstantSearchProps['initialUiState'];
};

function createTestEnvironment({
  searchClient,
  initialUiState = {
    instant_search: {
      query: 'iphone',
      refinementList: {
        brand: ['Apple'],
      },
    },
    instant_search_price_asc: {
      query: 'iphone',
      refinementList: {
        brand: ['Apple'],
      },
    },
  },
}: CreateTestEnvironmentProps) {
  function Search({ children }: { children?: React.ReactNode }) {
    return (
      <InstantSearch
        searchClient={searchClient}
        indexName="instant_search"
        initialUiState={initialUiState}
      >
        {children}
        <RefinementList attribute="brand" />
        <SearchBox />

        <h2>instant_search</h2>
        <Hits hitComponent={Hit} />

        <Index indexName="instant_search_price_asc">
          <h2>instant_search_price_asc</h2>
          <Hits hitComponent={Hit} />

          <Index indexName="instant_search_rating_desc">
            <h2>instant_search_rating_desc</h2>
            <Hits hitComponent={Hit} />
          </Index>
        </Index>

        <Index indexName="instant_search_price_desc">
          <h2>instant_search_price_desc</h2>
          <Hits hitComponent={Hit} />
        </Index>
      </InstantSearch>
    );
  }

  function App({
    serverState,
    children,
  }: {
    serverState?: InstantSearchServerState;
    children?: React.ReactNode;
  }) {
    return (
      <InstantSearchSSRProvider {...serverState}>
        <Search>{children}</Search>
      </InstantSearchSSRProvider>
    );
  }

  return {
    App,
  };
}

describe('getServerState', () => {
  test('throws without <InstantSearch> component', async () => {
    function App() {
      return null;
    }

    await expect(
      getServerState(<App />, { renderToString })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unable to retrieve InstantSearch's server state in \`getServerState()\`. Did you mount the <InstantSearch> component?"`
    );
  });

  test('throws with multiple <InstantSearch> components', async () => {
    function App({ serverState }: { serverState?: InstantSearchServerState }) {
      return (
        <InstantSearchSSRProvider {...serverState}>
          <InstantSearch
            searchClient={createSearchClient({})}
            indexName="index"
          />
          <InstantSearch
            searchClient={createSearchClient({})}
            indexName="index"
          />
        </InstantSearchSSRProvider>
      );
    }

    await expect(
      getServerState(<App />, { renderToString })
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"getServerState should be called with a single InstantSearchSSRProvider and a single InstantSearch component."`
    );
  });

  test('throws when the search client errors, async', async () => {
    const searchClient = createSearchClient({
      // Function is async to match the real search client.
      // a synchronous error would be caught by the derived helper, async by InstantSearch.
      // eslint-disable-next-line require-await
      search: async () => {
        throw new Error('Search client error');
      },
    });
    const { App } = createTestEnvironment({
      searchClient,
    });

    await expect(getServerState(<App />, { renderToString })).rejects.toThrow(
      /Search client error/
    );
  });

  test('throws when the search client errors, sync', async () => {
    const searchClient = createSearchClient({
      search: () => {
        throw new Error('Search client error');
      },
    });
    const { App } = createTestEnvironment({
      searchClient,
    });

    await expect(getServerState(<App />, { renderToString })).rejects.toThrow(
      /Search client error/
    );
  });

  test('adds the server user agents', async () => {
    const nextRuntime = 'nodejs';
    process.env.NEXT_RUNTIME = nextRuntime;

    const searchClient = createAlgoliaSearchClient({});
    const { App } = createTestEnvironment({ searchClient });

    await getServerState(<App />, { renderToString });

    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react (${ReactVersion})`
    );
    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react-instantsearch (${version})`
    );
    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react-instantsearch-hooks (${version})`
    );
    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react-instantsearch-server (${version})`
    );
    expect(searchClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `next.js (${nextRuntime})`
    );
  });

  test('calls search with widgets search parameters', async () => {
    const searchClient = createSearchClient({});
    const { App } = createTestEnvironment({ searchClient });

    await getServerState(<App />, { renderToString });

    expect(searchClient.search).toHaveBeenCalledTimes(1);
    expect(searchClient.search).toHaveBeenCalledWith([
      {
        indexName: 'instant_search',
        params: {
          facetFilters: [['brand:Apple']],
          facets: ['brand'],
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          maxValuesPerFacet: 10,
          query: 'iphone',
          tagFilters: '',
        },
      },
      {
        indexName: 'instant_search',
        params: {
          analytics: false,
          clickAnalytics: false,
          facets: 'brand',
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          hitsPerPage: 0,
          maxValuesPerFacet: 10,
          query: 'iphone',
          page: 0,
        },
      },
      {
        indexName: 'instant_search_price_asc',
        params: {
          facetFilters: [['brand:Apple']],
          facets: ['brand'],
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          maxValuesPerFacet: 10,
          query: 'iphone',
          tagFilters: '',
        },
      },
      {
        indexName: 'instant_search_price_asc',
        params: {
          analytics: false,
          clickAnalytics: false,
          facets: 'brand',
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          hitsPerPage: 0,
          maxValuesPerFacet: 10,
          page: 0,
          query: 'iphone',
        },
      },
      {
        indexName: 'instant_search_rating_desc',
        params: {
          facetFilters: [['brand:Apple']],
          facets: ['brand'],
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          maxValuesPerFacet: 10,
          query: 'iphone',
          tagFilters: '',
        },
      },
      {
        indexName: 'instant_search_rating_desc',
        params: {
          analytics: false,
          clickAnalytics: false,
          facets: 'brand',
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          hitsPerPage: 0,
          maxValuesPerFacet: 10,
          page: 0,
          query: 'iphone',
        },
      },
      {
        indexName: 'instant_search_price_desc',
        params: {
          facetFilters: [['brand:Apple']],
          facets: ['brand'],
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          maxValuesPerFacet: 10,
          query: 'iphone',
          tagFilters: '',
        },
      },
      {
        indexName: 'instant_search_price_desc',
        params: {
          analytics: false,
          clickAnalytics: false,
          facets: 'brand',
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          hitsPerPage: 0,
          maxValuesPerFacet: 10,
          page: 0,
          query: 'iphone',
        },
      },
    ]);
  });

  test('returns initialResults', async () => {
    const searchClient = createAlgoliaSearchClient({});
    const { App } = createTestEnvironment({ searchClient });

    const serverState = await getServerState(<App />, { renderToString });

    expect(Object.keys(serverState.initialResults)).toHaveLength(4);
    expect(serverState.initialResults).toMatchSnapshot();
  });

  test('searches twice (cached) with dynamic widgets', async () => {
    const searchClient = createAlgoliaSearchClient({});
    const { App } = createTestEnvironment({ searchClient, initialUiState: {} });

    await getServerState(
      <App>
        <DynamicWidgets fallbackComponent={RefinementList} />
      </App>,
      { renderToString }
    );

    expect(searchClient.search).toHaveBeenCalledTimes(2);
    // both calls are the same, so they're cached
    expect(searchClient.search.mock.calls[0][0]).toEqual(
      searchClient.search.mock.calls[1][0]
    );
  });

  test('searches twice (cached) with dynamic widgets inside index', async () => {
    const searchClient = createAlgoliaSearchClient({});
    const { App } = createTestEnvironment({ searchClient, initialUiState: {} });

    await getServerState(
      <App>
        <Index indexName="something">
          <DynamicWidgets fallbackComponent={RefinementList} />
        </Index>
      </App>,
      { renderToString }
    );

    expect(searchClient.search).toHaveBeenCalledTimes(2);
    // both calls are the same, so they're cached
    expect(searchClient.search.mock.calls[0][0]).toEqual(
      searchClient.search.mock.calls[1][0]
    );
  });

  test('searches twice with dynamic widgets and a refinement', async () => {
    const searchClient = createAlgoliaSearchClient({
      search: jest.fn((requests) => {
        return Promise.resolve(
          createMultiSearchResponse(
            ...requests.map(() =>
              createSingleSearchResponse({
                renderingContent: defaultRenderingContent,
              })
            )
          )
        );
      }),
    });
    const { App } = createTestEnvironment({
      searchClient,
      initialUiState: {
        instant_search: {
          refinementList: {
            categories: ['refined!'],
          },
        },
      },
    });

    await getServerState(
      <App>
        <DynamicWidgets fallbackComponent={RefinementList} />
      </App>,
      { renderToString }
    );

    expect(searchClient.search).toHaveBeenCalledTimes(2);

    // first query doesn't have the fallback widget mounted yet
    expect(searchClient.search.mock.calls[0][0][0]).toEqual({
      indexName: 'instant_search',
      params: {
        facets: ['*'],
        highlightPostTag: '__/ais-highlight__',
        highlightPreTag: '__ais-highlight__',
        maxValuesPerFacet: 20,
        query: '',
        tagFilters: '',
      },
    });

    // second query does have the fallback widget mounted, and thus also the refinement
    expect(searchClient.search.mock.calls[1][0][0]).toEqual({
      indexName: 'instant_search',
      params: {
        facetFilters: [['categories:refined!']],
        facets: ['*'],
        highlightPostTag: '__/ais-highlight__',
        highlightPreTag: '__ais-highlight__',
        maxValuesPerFacet: 20,
        query: '',
        tagFilters: '',
      },
    });
  });

  test('returns HTML from server state', async () => {
    const searchClient = createSearchClient({
      search: jest.fn((requests) =>
        Promise.resolve(
          createMultiSearchResponse(
            ...requests.map(() =>
              createSingleSearchResponse({
                hits: [{ objectID: '1' }, { objectID: '2' }],
              })
            )
          )
        )
      ) as MockSearchClient['search'],
    });
    const { App } = createTestEnvironment({ searchClient });

    const serverState = await getServerState(<App />, { renderToString });
    const html = renderToString(<App serverState={serverState} />);

    expect(html).toMatchInlineSnapshot(`
      <div class="ais-RefinementList ais-RefinementList--noRefinement">
        <ul class="ais-RefinementList-list">
        </ul>
      </div>
      <div class="ais-SearchBox">
        <form action
              class="ais-SearchBox-form"
              novalidate
        >
          <input class="ais-SearchBox-input"
                 value="iphone"
          >
        </form>
      </div>
      <h2>
        instant_search
      </h2>
      <div class="ais-Hits">
        <ol class="ais-Hits-list">
          <li class="ais-Hits-item">
            1
          </li>
          <li class="ais-Hits-item">
            2
          </li>
        </ol>
      </div>
      <h2>
        instant_search_price_asc
      </h2>
      <div class="ais-Hits">
        <ol class="ais-Hits-list">
          <li class="ais-Hits-item">
            1
          </li>
          <li class="ais-Hits-item">
            2
          </li>
        </ol>
      </div>
      <h2>
        instant_search_rating_desc
      </h2>
      <div class="ais-Hits">
        <ol class="ais-Hits-list">
          <li class="ais-Hits-item">
            1
          </li>
          <li class="ais-Hits-item">
            2
          </li>
        </ol>
      </div>
      <h2>
        instant_search_price_desc
      </h2>
      <div class="ais-Hits">
        <ol class="ais-Hits-list">
          <li class="ais-Hits-item">
            1
          </li>
          <li class="ais-Hits-item">
            2
          </li>
        </ol>
      </div>
    `);
  });
});
