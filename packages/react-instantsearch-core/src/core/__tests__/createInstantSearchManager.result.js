import { wait } from '@instantsearch/testutils';

import createInstantSearchManager from '../createInstantSearchManager';

const createSearchClient = () => ({
  search: jest.fn(() =>
    Promise.resolve({
      results: [
        {
          hits: [{ value: 'results' }],
        },
      ],
    })
  ),
  searchForFacetValues: jest.fn(() =>
    Promise.resolve([
      {
        facetHits: [{ value: 'results' }],
      },
    ])
  ),
});

describe('createInstantSearchManager with results', () => {
  describe('on search', () => {
    it('updates the store on widget lifecycle', async () => {
      const searchClient = createSearchClient({});

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.widgetsManager.registerWidget({
        getSearchParameters: (params) => params.setQuery('search'),
        props: {},
        context: {},
      });

      expect(ism.store.getState().results).toBe(null);

      await wait(0);

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(ism.store.getState().results.hits).toEqual([{ value: 'results' }]);
      expect(ism.store.getState().error).toBe(null);

      ism.widgetsManager.update();

      await wait(0);

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(ism.store.getState().results.hits).toEqual([{ value: 'results' }]);
      expect(ism.store.getState().error).toBe(null);
    });

    it('updates the store on external updates', async () => {
      const searchClient = createSearchClient({});

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.onExternalStateUpdate({});

      await wait(0);

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(ism.store.getState().results.hits).toEqual([{ value: 'results' }]);
      expect(ism.store.getState().error).toBe(null);

      ism.onExternalStateUpdate({});

      await wait(0);

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(ism.store.getState().results.hits).toEqual([{ value: 'results' }]);
      expect(ism.store.getState().error).toBe(null);
    });
  });

  describe('on search for facet values', () => {
    // We should avoid to rely on such mock, we mostly do an integration tests rather than
    // a unit ones for the manager. We have to simulate a real helper environement (facet,
    // etc, ...) to have something that don't throw errors. An easier way would be to provide
    // the helper to the manager with the real implementation by default. With this, we can easily
    // pass a custom helper (mocked or not) and don't rely on the helper + client.

    it('updates the store and searches', async () => {
      const searchClient = createSearchClient({});

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      // We have to register the facet to be able to search on it
      ism.widgetsManager.registerWidget({
        getSearchParameters: (params) => params.addFacet('facetName'),
        props: {},
        context: {},
      });

      await wait(0);

      ism.onSearchForFacetValues({
        facetName: 'facetName',
        query: 'query',
      });

      expect(ism.store.getState().searchingForFacetValues).toBe(true);

      await wait(0);

      expect(ism.store.getState().searchingForFacetValues).toBe(false);

      expect(searchClient.searchForFacetValues).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              facetName: 'facetName',
              facetQuery: 'query',
              maxFacetHits: 10,
            }),
          }),
        ])
      );

      expect(ism.store.getState().resultsFacetValues).toEqual({
        facetName: [expect.objectContaining({ value: 'results' })],
        query: 'query',
      });
    });

    it('updates the store and searches with maxFacetHits', async () => {
      const searchClient = createSearchClient({});

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      // We have to register the facet to be able to search on it
      ism.widgetsManager.registerWidget({
        getSearchParameters: (params) => params.addFacet('facetName'),
        props: {},
        context: {},
      });

      await wait(0);

      ism.onSearchForFacetValues({
        facetName: 'facetName',
        query: 'query',
        maxFacetHits: 25,
      });

      await wait(0);

      expect(searchClient.searchForFacetValues).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              maxFacetHits: 25,
            }),
          }),
        ])
      );
    });

    it('updates the store and searches with maxFacetHits out of range (higher)', async () => {
      const searchClient = createSearchClient({});

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      // We have to register the facet to be able to search on it
      ism.widgetsManager.registerWidget({
        getSearchParameters: (params) => params.addFacet('facetName'),
        props: {},
        context: {},
      });

      await wait(0);

      ism.onSearchForFacetValues({
        facetName: 'facetName',
        query: 'query',
        maxFacetHits: 125,
      });

      await wait(0);

      expect(searchClient.searchForFacetValues).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              maxFacetHits: 100,
            }),
          }),
        ])
      );
    });

    it('updates the store and searches with maxFacetHits out of range (lower)', async () => {
      const searchClient = createSearchClient({});

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      // We have to register the facet to be able to search on it
      ism.widgetsManager.registerWidget({
        getSearchParameters: (params) => params.addFacet('facetName'),
        props: {},
        context: {},
      });

      await wait(0);

      ism.onSearchForFacetValues({
        facetName: 'facetName',
        query: 'query',
        maxFacetHits: 0,
      });

      await wait(0);

      expect(searchClient.searchForFacetValues).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            params: expect.objectContaining({
              maxFacetHits: 1,
            }),
          }),
        ])
      );
    });
  });
});
