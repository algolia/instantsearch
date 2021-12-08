/**
 * @jest-environment node
 */

import React, { version as ReactVersion } from 'react';
import {
  InstantSearch,
  InstantSearchSSRProvider,
  Index,
  useHits,
  useRefinementList,
  useSearchBox,
  version,
} from 'react-instantsearch-hooks';

import { createSearchClient } from '../../../../test/mock';
import { getServerState } from '../getServerState';

import type algoliasearch from 'algoliasearch/lite';
import type {
  InstantSearchServerState,
  UseRefinementListProps,
} from 'react-instantsearch-hooks';

type SearchClient = ReturnType<typeof algoliasearch>;

type CreateTestEnvironmentProps = {
  searchClient: SearchClient;
};

function createTestEnvironment({ searchClient }: CreateTestEnvironmentProps) {
  function Search() {
    return (
      <InstantSearch
        searchClient={searchClient}
        indexName="instant_search"
        initialUiState={{
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
        }}
      >
        <RefinementList attribute="brand" />
        <SearchBox />
        <Hits />

        <Index indexName="instant_search_price_asc">
          <Hits />

          <Index indexName="instant_search_rating_desc">
            <Hits />
          </Index>
        </Index>

        <Index indexName="instant_search_price_desc">
          <Hits />
        </Index>
      </InstantSearch>
    );
  }

  function App({ serverState }: { serverState?: InstantSearchServerState }) {
    return (
      <InstantSearchSSRProvider {...serverState}>
        <Search />
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
      getServerState(<App />)
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unable to retrieve InstantSearch's server state in \`getServerState()\`. Did you mount the <InstantSearch> component?"`
    );
  });

  test('throws when the search client errors', async () => {
    const searchClient = createSearchClient({
      search: () => {
        throw new Error('Search client error');
      },
    });
    const { App } = createTestEnvironment({ searchClient });

    await expect(getServerState(<App />)).rejects.toThrow(
      /Search client error/
    );
  });

  test('adds the server user agents', async () => {
    const searchClient = createSearchClient();
    const { App } = createTestEnvironment({ searchClient });

    await getServerState(<App />);

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
  });

  test('calls search with widgets search parameters', async () => {
    const searchClient = createSearchClient();
    const { App } = createTestEnvironment({ searchClient });

    await getServerState(<App />);

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
          attributesToHighlight: [],
          attributesToRetrieve: [],
          attributesToSnippet: [],
          clickAnalytics: false,
          facets: 'brand',
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          hitsPerPage: 1,
          maxValuesPerFacet: 10,
          query: 'iphone',
          page: 0,
          tagFilters: '',
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
          attributesToHighlight: [],
          attributesToRetrieve: [],
          attributesToSnippet: [],
          clickAnalytics: false,
          facets: 'brand',
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          hitsPerPage: 1,
          maxValuesPerFacet: 10,
          page: 0,
          query: 'iphone',
          tagFilters: '',
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
          attributesToHighlight: [],
          attributesToRetrieve: [],
          attributesToSnippet: [],
          clickAnalytics: false,
          facets: 'brand',
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          hitsPerPage: 1,
          maxValuesPerFacet: 10,
          page: 0,
          query: 'iphone',
          tagFilters: '',
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
          attributesToHighlight: [],
          attributesToRetrieve: [],
          attributesToSnippet: [],
          clickAnalytics: false,
          facets: 'brand',
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
          hitsPerPage: 1,
          maxValuesPerFacet: 10,
          page: 0,
          query: 'iphone',
          tagFilters: '',
        },
      },
    ]);
  });

  test('returns initialResults', async () => {
    const searchClient = createSearchClient();
    const { App } = createTestEnvironment({ searchClient });

    const serverState = await getServerState(<App />);

    expect(Object.keys(serverState.initialResults)).toHaveLength(4);
    expect(serverState.initialResults).toMatchSnapshot();
  });
});

function SearchBox() {
  useSearchBox();
  return null;
}

function Hits() {
  useHits();
  return null;
}

function RefinementList(props: UseRefinementListProps) {
  useRefinementList(props);
  return null;
}
