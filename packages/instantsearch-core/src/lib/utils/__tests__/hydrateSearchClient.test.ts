import algoliasearchV3 from 'algoliasearch-v3';
import algoliasearchV4 from 'algoliasearch-v4';
import { liteClient as algoliasearchV5 } from 'algoliasearch-v5/lite';

import { hydrateSearchClient } from '..';

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
      search: jest.fn(),
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
      search: jest.fn(),
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
      search: jest.fn(),
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
        requestParams: [
          {
            source: 'request',
          },
        ],
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

  it('should handle multiple indices and multiple queries per index', () => {
    const setCache = jest.fn();
    client = {
      transporter: { responsesCache: { set: setCache } },
      addAlgoliaAgent: jest.fn(),
      search: jest.fn(),
    } as unknown as SearchClient;

    hydrateSearchClient(client, {
      instant_search: {
        results: [
          { index: 'instant_search', params: 'source=results', nbHits: 1000 },
          {
            index: 'instant_search',
            params: 'source=results&hitsPerPage=0',
            nbHits: 1000,
          },
        ],
        state: {},
        requestParams: [
          {
            source: 'request',
          },
          {
            source: 'request',
            hitsPerPage: 0,
          },
        ],
      },
      instant_search_price_desc: {
        results: [
          {
            index: 'instant_search_price_desc',
            params: 'source=results',
            nbHits: 1000,
          },
        ],
        state: {},
        requestParams: [
          {
            source: 'request',
          },
        ],
      },
    } as unknown as InitialResults);

    expect(setCache).toHaveBeenCalledWith(
      expect.objectContaining({
        args: [
          [
            { indexName: 'instant_search', params: 'source=request' },
            {
              indexName: 'instant_search',
              params: 'source=request&hitsPerPage=0',
            },
            {
              indexName: 'instant_search_price_desc',
              params: 'source=request',
            },
          ],
        ],
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
      search: jest.fn(),
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
        search: jest.fn(),
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

  it('should not throw if state or results are missing', () => {
    const setCache = jest.fn();
    client = {
      transporter: { responsesCache: { set: setCache } },
      addAlgoliaAgent: jest.fn(),
      search: jest.fn(),
    } as unknown as SearchClient;

    hydrateSearchClient(client, {
      instant_search: {},
    } as unknown as InitialResults);

    expect(setCache).toHaveBeenCalledWith(
      expect.objectContaining({
        args: [[]],
        method: 'search',
      }),
      { results: [] }
    );
  });

  it('should not throw if search requires to be bound (v5)', async () => {
    const send = jest.fn().mockResolvedValue({ status: 200, content: '{}' });
    const searchClient: any = algoliasearchV5('appId', 'apiKey', {
      requester: {
        send,
      },
    });

    hydrateSearchClient(searchClient, initialResults);

    await searchClient.search([{ indexName: 'another', params: {} }]);

    expect(send).toHaveBeenCalled();
  });

  it('should not throw if search requires to be bound (v4)', async () => {
    const send = jest.fn().mockResolvedValue({ status: 200, content: '{}' });
    const searchClient: any = algoliasearchV4('appId', 'apiKey', {
      requester: {
        send,
      },
    });

    hydrateSearchClient(searchClient, initialResults);

    await searchClient.search([{ indexName: 'another', params: {} }]);

    expect(send).toHaveBeenCalled();
  });

  it('should not throw if search requires to be bound (v3)', async () => {
    const searchClient: any = algoliasearchV3('appId', 'apiKey');
    searchClient._request = jest
      .fn()
      .mockResolvedValue({ body: { status: 200 } });

    hydrateSearchClient(searchClient, initialResults);

    await searchClient.search([{ indexName: 'another', params: {} }]);

    expect(searchClient._request).toHaveBeenCalled();
  });
});
