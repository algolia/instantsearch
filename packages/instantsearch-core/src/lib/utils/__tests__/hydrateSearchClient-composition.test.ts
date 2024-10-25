import { createCompositionClient } from '@instantsearch/mocks';

import { hydrateSearchClient } from '../hydrateSearchClient';

import type { InitialResults, CompositionClient } from '../../../types';

const setupCompositionClient = () => {
  const getCache = jest.fn();
  const setCache = jest.fn();
  const search: CompositionClient['search'] = jest.fn();
  const client: CompositionClient & {
    _cacheHydrated?: boolean;
    _useCache?: boolean;
    cache?: Record<string, string>;
  } = createCompositionClient({
    transporter: { responsesCache: { set: setCache, get: getCache } },
    addAlgoliaAgent: jest.fn(),
    search,
  });

  return { client, getCache, setCache, search };
};

describe('hydrateSearchClient (composition)', () => {
  const initialResults = {
    instant_search: {
      results: [{ params: 'params', nbHits: 1000 }],
      state: {},
      rawResults: [{ params: 'params', nbHits: 1000 }],
    },
  } as unknown as InitialResults;

  it('should hydrate the client if the cache is enabled and the Algolia agent is present', () => {
    const { client, setCache } = setupCompositionClient();

    hydrateSearchClient(client, initialResults);

    expect(setCache).toHaveBeenCalledTimes(1);
    expect(setCache).toHaveBeenCalledWith(
      expect.objectContaining({
        args: [[{ params: 'params=' }]],
        method: 'search',
      }),
      expect.objectContaining({
        results: [{ params: 'params', nbHits: 1000 }],
      })
    );
    expect(client._cacheHydrated).toBe(true);
    expect(client.search).toBeDefined();
  });

  describe('when calling client.search (with composition params)', () => {
    it('should call getCache but not client initial search function', () => {
      const { client, getCache, search } = setupCompositionClient();

      hydrateSearchClient(client, initialResults);

      client.search({
        compositionID: 'my-composition',
        requestBody: { params: { query: 'test' } },
      });

      expect(getCache).toHaveBeenCalledTimes(1);
      expect(getCache).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          args: ['query=test'],
          method: 'search',
        }),
        expect.any(Function)
      );
      expect(search).not.toHaveBeenCalled();
    });

    describe('calling cache getter function', () => {
      it('should call client initial search function (with composition params)', () => {
        const { client, getCache, search } = setupCompositionClient();

        hydrateSearchClient(client, initialResults);

        expect(search).not.toHaveBeenCalled();

        client.search({
          compositionID: 'my-composition',
          requestBody: { params: { query: 'test' } },
        });

        expect(getCache).toHaveBeenCalledTimes(1);
        expect(getCache).toHaveBeenNthCalledWith(
          1,
          expect.anything(),
          expect.any(Function)
        );
        const cacheGetter = getCache.mock.calls[0][1];

        cacheGetter();

        expect(search).toHaveBeenCalledTimes(1);
        expect(search).toHaveBeenNthCalledWith(1, {
          compositionID: 'my-composition',
          requestBody: { params: { query: 'test' } },
        });
      });
    });
  });
});
