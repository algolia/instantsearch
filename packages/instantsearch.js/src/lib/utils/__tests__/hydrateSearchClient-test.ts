import { hydrateSearchClient } from '../hydrateSearchClient';

import type { SearchClient, InitialResults } from '../../../types';

describe('hydrateSearchClient', () => {
  let client: SearchClient & {
    _cacheHydrated?: boolean;
    _useCache?: boolean;
    cache?: Record<string, string>;
  };
  const initialResults = {
    instant_search: {
      results: [{ index: 'instant_search', params: 'params', nbHits: 1000 }],
      state: {},
      rawResults: [{ index: 'instant_search', params: 'params', nbHits: 1000 }],
    },
  } as unknown as InitialResults;

  it('should not hydrate the client if no results are provided', () => {
    client = {} as unknown as SearchClient;
    hydrateSearchClient(client, undefined);

    expect(client._cacheHydrated).not.toBeDefined();
  });

  it('should not hydrate the client if the cache is disabled', () => {
    client = { _useCache: false } as unknown as SearchClient;

    hydrateSearchClient(client, initialResults);

    expect(client._cacheHydrated).not.toBeDefined();
  });

  it('should not hydrate the client if `addAlgoliaAgent` is missing', () => {
    client = { addAlgoliaAgent: undefined } as unknown as SearchClient;

    hydrateSearchClient(client, initialResults);

    expect(client._cacheHydrated).not.toBeDefined();
  });

  it('should hydrate the client for >= v4 if the cache is enabled and the Algolia agent is present', () => {
    const setCache = jest.fn();
    client = {
      transporter: { responsesCache: { set: setCache } },
      addAlgoliaAgent: jest.fn(),
    } as unknown as SearchClient;

    hydrateSearchClient(client, initialResults);

    expect(setCache).toHaveBeenCalledWith(
      expect.objectContaining({
        args: [[{ indexName: 'instant_search', params: 'params' }]],
        method: 'search',
      }),
      expect.objectContaining({
        results: [{ index: 'instant_search', params: 'params', nbHits: 1000 }],
      })
    );
    expect(client._cacheHydrated).toBe(true);
    expect(client.search).toBeDefined();
  });

  it('should populate the cache for < v4 if there is no transporter object', () => {
    client = {
      addAlgoliaAgent: jest.fn(),
      _useCache: true,
    } as unknown as SearchClient;

    hydrateSearchClient(client, initialResults);

    expect(client.cache).toBeDefined();
  });
});
