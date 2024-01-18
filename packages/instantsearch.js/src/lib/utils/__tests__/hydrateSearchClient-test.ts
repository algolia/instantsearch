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
        args: [[{ indexName: 'instant_search', params: 'params=' }]],
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

  it('should use request params by default', () => {
    const setCache = jest.fn();
    client = {
      transporter: { responsesCache: { set: setCache } },
      addAlgoliaAgent: jest.fn(),
    } as unknown as SearchClient;

    hydrateSearchClient(client, {
      instant_search: {
        results: [
          { index: 'instant_search', params: 'source=results', nbHits: 1000 },
        ],
        state: {},
        rawResults: [
          { index: 'instant_search', params: 'source=results', nbHits: 1000 },
        ],
        requestParams: {
          source: 'request',
        },
      },
    } as unknown as InitialResults);

    expect(setCache).toHaveBeenCalledWith(
      expect.objectContaining({
        args: [[{ indexName: 'instant_search', params: 'source=request' }]],
        method: 'search',
      }),
      expect.anything()
    );
  });

  it('should use results params as a fallback', () => {
    const setCache = jest.fn();
    client = {
      transporter: { responsesCache: { set: setCache } },
      addAlgoliaAgent: jest.fn(),
    } as unknown as SearchClient;

    hydrateSearchClient(client, {
      instant_search: {
        results: [
          { index: 'instant_search', params: 'source=results', nbHits: 1000 },
        ],
        state: {},
        rawResults: [
          { index: 'instant_search', params: 'source=results', nbHits: 1000 },
        ],
      },
    } as unknown as InitialResults);

    expect(setCache).toHaveBeenCalledWith(
      expect.objectContaining({
        args: [[{ indexName: 'instant_search', params: 'source=results' }]],
        method: 'search',
      }),
      expect.anything()
    );
  });

  it('should not throw if there are no params from request or results to generate the cache with', () => {
    expect(() => {
      client = {
        transporter: { responsesCache: { set: jest.fn() } },
        addAlgoliaAgent: jest.fn(),
      } as unknown as SearchClient;

      hydrateSearchClient(client, {
        instant_search: {
          results: [{ index: 'instant_search', nbHits: 1000 }],
          state: {},
          rawResults: [{ index: 'instant_search', nbHits: 1000 }],
        },
      } as unknown as InitialResults);
    }).not.toThrow();
  });
});
