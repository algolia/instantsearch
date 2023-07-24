/**
 * @jest-environment jsdom
 */

import { wait } from '@instantsearch/testutils';
import { render, cleanup } from '@testing-library/react';
import algoliasearch from 'algoliasearch';
import nock from 'nock';
import React from 'react';
import { InstantSearch, SearchBox, Index } from 'react-instantsearch-dom';

// @ts-ignore: `version` is not present on Algoliasearch v3 type declaration
const CLIENT_VERSION_LOWER_THAN_V4 = /^[0-3]\./.test(algoliasearch.version);

const EMPTY_RESPONSE = {
  results: [
    {
      hits: [],
      nbHits: 0,
      page: 0,
      nbPages: 0,
      hitsPerPage: 20,
      exhaustiveNbHits: true,
      query: '',
      queryAfterRemoval: '',
      params:
        'facets=%5B%5D&highlightPostTag=%3C%2Fais-highlight-0000000000%3E&highlightPreTag=%3Cais-highlight-0000000000%3E&query=&tagFilters=',
      index: 'instant_search',
      processingTimeMS: 2,
    },
  ],
};

nock.disableNetConnect();

describe('InstantSearch', () => {
  describe('client hydratation', () => {
    let scope;
    let requests: jest.Mock;
    beforeEach(() => {
      scope = nock('https://latency-dsn.algolia.net:443')
        .persist()
        .post(/.*/)
        .reply(200, EMPTY_RESPONSE);

      requests = jest.fn();
      scope.on('request', requests);
    });

    afterEach(() => {
      cleanup();
      nock.cleanAll();
    });

    it('hydrates the `searchClient` for a single index results', async () => {
      // Skip this test with Algoliasearch API Client < v4
      // (cache is tested in /packages/react-instantsearch-core/src/core/__tests__/createInstantSearchManager.js)
      if (CLIENT_VERSION_LOWER_THAN_V4) {
        return;
      }

      const { createInMemoryCache } = require('@algolia/cache-in-memory');

      const searchClient = algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76',
        {
          // @ts-ignore: `responsesCache` does not exists on Algoliasearch API Client < v4
          responsesCache: createInMemoryCache(),
        }
      );

      const resultsState = {
        metadata: [],
        rawResults: EMPTY_RESPONSE.results,
        state: {
          index: 'instant_search',
          query: '',
        },
      };

      render(
        <InstantSearch
          indexName="instant_search"
          searchClient={searchClient}
          resultsState={resultsState}
        >
          <SearchBox />
        </InstantSearch>
      );

      await wait(0);

      expect(requests).toHaveBeenCalledTimes(0);
    });

    it('hydrates the `searchClient` for a multi index results', async () => {
      // Skip this test with Algoliasearch API Client < v4
      // (cache is tested in /packages/react-instantsearch-core/src/core/__tests__/createInstantSearchManager.js)
      if (CLIENT_VERSION_LOWER_THAN_V4) {
        return;
      }

      const { createInMemoryCache } = require('@algolia/cache-in-memory');

      const searchClient = algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76',
        {
          // @ts-ignore: `responsesCache` does not exists on Algoliasearch API Client < v4
          responsesCache: createInMemoryCache(),
        }
      );

      const resultsState = {
        metadata: [],
        results: [
          {
            rawResults: EMPTY_RESPONSE.results,
            state: {
              index: 'instant_search',
              query: '',
            },
          },
          {
            rawResults: [
              {
                ...EMPTY_RESPONSE.results[0],
                index: 'instant_search2',
              },
            ],
            state: {
              index: 'instant_search2',
              query: '',
            },
          },
        ],
      };

      render(
        <InstantSearch
          indexName="instant_search"
          searchClient={searchClient}
          resultsState={resultsState}
        >
          <SearchBox />
          <Index indexId="instant_search2" indexName="instant_search2">
            <SearchBox />
          </Index>
        </InstantSearch>
      );

      await wait(0);

      expect(requests).toHaveBeenCalledTimes(0);
    });

    it('does not hydrate the `searchClient` without results', async () => {
      // Skip this test with Algoliasearch API Client < v4
      // (cache is tested in /packages/react-instantsearch-core/src/core/__tests__/createInstantSearchManager.js)
      if (CLIENT_VERSION_LOWER_THAN_V4) {
        return;
      }

      const { createInMemoryCache } = require('@algolia/cache-in-memory');

      const searchClient = algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76',
        {
          // @ts-ignore: `responsesCache` does not exists on Algoliasearch API Client < v4
          responsesCache: createInMemoryCache(),
        }
      );

      render(
        <InstantSearch indexName="instant_search" searchClient={searchClient}>
          <SearchBox />
        </InstantSearch>
      );

      await wait(0);

      expect(requests).toHaveBeenCalledTimes(1);
    });

    it("does not hydrate the `searchClient` if it's not an Algolia client", async () => {
      // Skip this test with Algoliasearch API Client < v4
      // (cache is tested in /packages/react-instantsearch-core/src/core/__tests__/createInstantSearchManager.js)
      if (CLIENT_VERSION_LOWER_THAN_V4) {
        return;
      }

      const searchClient = {
        search: jest.fn(),
      };

      const resultsState = {
        metadata: [],
        rawResults: EMPTY_RESPONSE.results,
        state: {
          index: 'instant_search',
          query: '',
        },
      };

      render(
        <InstantSearch
          indexName="instant_search"
          searchClient={searchClient}
          resultsState={resultsState}
        >
          <SearchBox />
        </InstantSearch>
      );

      await wait(0);

      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    it('does not hydrate the `searchClient` without cache enabled', async () => {
      // Skip this test with Algoliasearch API Client < v4
      // (cache is tested in /packages/react-instantsearch-core/src/core/__tests__/createInstantSearchManager.js)
      if (CLIENT_VERSION_LOWER_THAN_V4) {
        return;
      }

      const searchClient = algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76'
      );

      const resultsState = {
        metadata: [],
        rawResults: EMPTY_RESPONSE.results,
        state: {
          index: 'instant_search',
          query: '',
        },
      };

      render(
        <InstantSearch
          indexName="instant_search"
          searchClient={searchClient}
          resultsState={resultsState}
        >
          <SearchBox />
        </InstantSearch>
      );

      await wait(0);

      expect(requests).toHaveBeenCalledTimes(1);
    });
  });
});
