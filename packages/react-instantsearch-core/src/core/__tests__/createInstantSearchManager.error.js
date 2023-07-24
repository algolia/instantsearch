import { wait } from '@instantsearch/testutils';

import createInstantSearchManager from '../createInstantSearchManager';

const createSearchClient = () => ({
  search: jest.fn(),
  searchForFacetValues: jest.fn(),
});

describe('createInstantSearchManager with errors', () => {
  describe('on search', () => {
    it('updates the store on widget lifecycle', async () => {
      const searchClient = createSearchClient({});

      searchClient.search.mockImplementation(() =>
        Promise.reject(new Error('API_ERROR_1'))
      );

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.widgetsManager.registerWidget({
        getSearchParameters: (params) => params.setQuery('search'),
        context: {},
        props: {},
      });

      expect(ism.store.getState().error).toBe(null);

      await wait(0);

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(ism.store.getState().error).toEqual(new Error('API_ERROR_1'));
      expect(ism.store.getState().results).toEqual(null);

      searchClient.search.mockImplementation(() =>
        Promise.reject(new Error('API_ERROR_2'))
      );

      ism.widgetsManager.update();

      await wait(0);

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(ism.store.getState().error).toEqual(new Error('API_ERROR_2'));
      expect(ism.store.getState().results).toEqual(null);
    });

    it('updates the store on external updates', async () => {
      const searchClient = createSearchClient({});

      searchClient.search.mockImplementation(() =>
        Promise.reject(new Error('API_ERROR_1'))
      );

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.onExternalStateUpdate({});

      expect(ism.store.getState().error).toBe(null);

      await wait(0);

      expect(searchClient.search).toHaveBeenCalledTimes(1);
      expect(ism.store.getState().error).toEqual(new Error('API_ERROR_1'));
      expect(ism.store.getState().results).toEqual(null);

      searchClient.search.mockImplementation(() =>
        Promise.reject(new Error('API_ERROR_2'))
      );

      ism.onExternalStateUpdate({});

      await wait(0);

      expect(searchClient.search).toHaveBeenCalledTimes(2);
      expect(ism.store.getState().error).toEqual(new Error('API_ERROR_2'));
      expect(ism.store.getState().results).toEqual(null);
    });

    it('reset the error after a successful search', async () => {
      const searchClient = createSearchClient({});

      searchClient.search.mockImplementation(() =>
        Promise.reject(new Error('API_ERROR'))
      );

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.widgetsManager.registerWidget({
        getSearchParameters: (params) => params.setQuery('search'),
        context: {},
        props: {},
      });

      expect(ism.store.getState().error).toBe(null);

      await wait(0);

      expect(ism.store.getState().error).toEqual(new Error('API_ERROR'));
      expect(ism.store.getState().results).toEqual(null);

      searchClient.search.mockImplementation(() =>
        Promise.resolve({
          results: [
            {
              hits: [],
            },
          ],
        })
      );

      ism.widgetsManager.update();

      await wait(0);

      expect(ism.store.getState().error).toEqual(null);
      expect(ism.store.getState().results).toEqual(
        expect.objectContaining({
          hits: [],
        })
      );
    });
  });

  describe('on search for facet values', () => {
    it('updates the store on function call', async () => {
      const searchClient = createSearchClient({});

      searchClient.searchForFacetValues.mockImplementation(() =>
        Promise.reject(new Error('API_ERROR'))
      );

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.onSearchForFacetValues({
        facetName: 'facetName',
        query: 'query',
      });

      expect(ism.store.getState().searchingForFacetValues).toBe(true);
      expect(ism.store.getState().error).toBe(null);

      await wait(0);

      expect(ism.store.getState().searchingForFacetValues).toBe(false);
      expect(ism.store.getState().error).toEqual(new Error('API_ERROR'));
    });

    it('reset the error after a successful search', async () => {
      const searchClient = createSearchClient({});

      searchClient.searchForFacetValues.mockImplementation(() =>
        Promise.reject(new Error('API_ERROR'))
      );

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.onSearchForFacetValues({
        facetName: 'facetName',
        query: 'query',
      });

      expect(ism.store.getState().error).toBe(null);

      await wait(0);

      expect(ism.store.getState().error).toEqual(new Error('API_ERROR'));
      expect(ism.store.getState().resultsFacetValues).toBeUndefined();

      searchClient.searchForFacetValues.mockImplementation(() =>
        Promise.resolve([
          {
            facetHits: [],
          },
        ])
      );

      ism.onSearchForFacetValues({
        facetName: 'facetName',
        query: 'query',
      });

      await wait(0);

      expect(ism.store.getState().error).toBe(null);
      expect(ism.store.getState().resultsFacetValues).toEqual(
        expect.objectContaining({
          facetName: [],
          query: 'query',
        })
      );
    });
  });
});
