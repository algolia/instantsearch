import algoliaClient from 'algoliasearch/lite';
import createInstantSearchManager from './createInstantSearchManager';

jest.useFakeTimers();

const defaultResponse = () => ({
  results: [
    {
      params: 'query=&hitsPerPage=10&page=0&facets=%5B%5D&tagFilters=',
      page: 0,
      hits: [],
      hitsPerPage: 10,
      nbPages: 0,
      processingTimeMS: 4,
      query: '',
      nbHits: 0,
      index: 'index',
    },
  ],
});

describe('createInstantSearchManager', () => {
  it('initializes the manager with an empty state', () => {
    const ism = createInstantSearchManager({
      indexName: 'index',
      initialState: {},
      searchParameters: {},
      searchClient: makeClient(defaultResponse()),
    });

    const store = ism.store.getState();
    expect(store).toEqual({
      error: null,
      isSearchStalled: true,
      metadata: [],
      results: null,
      searching: false,
      searchingForFacetValues: false,
      widgets: {},
    });

    const widgets = ism.widgetsManager.getWidgets();
    expect(widgets).toEqual([]);

    const nextState = {};
    const transitionnedState = ism.transitionState(nextState);
    expect(transitionnedState).toBe(nextState);

    const widgetIds = ism.getWidgetsIds();
    expect(widgetIds).toEqual([]);
  });

  it('initialize with results', () => {
    const ism = createInstantSearchManager({
      indexName: 'index',
      initialState: {},
      searchParameters: {},
      searchClient: makeClient(defaultResponse()),
      resultsState: { some: 'results' },
    });

    const store = ism.store.getState();
    expect(store).toEqual({
      error: null,
      metadata: [],
      results: { some: 'results' },
      searching: false,
      searchingForFacetValues: false,
      widgets: {},
      isSearchStalled: true,
    });
  });

  describe('Widget manager', () => {
    it('triggers the search when a widget is added', () => {
      expect.assertions(2);

      const ism = createInstantSearchManager({
        indexName: 'index',
        initialState: {},
        searchParameters: {},
        searchClient: makeClient(defaultResponse()),
      });

      ism.widgetsManager.registerWidget({
        props: {},
        context: {},
        getMetadata: () => ({}),
        getSearchParameters: () => ({}),
        transitionState: () => ({}),
      });

      const storeT0 = ism.store.getState();
      expect(storeT0.searching).toBe(false);

      return Promise.resolve().then(() => {
        const storeT1 = ism.store.getState();
        expect(storeT1.searching).toBe(true);
      });
    });
  });

  describe('transitionstate', () => {
    it('executes widgets transitionstate hooks', () => {
      const ism = createInstantSearchManager({
        indexName: 'index',
        initialState: {},
        searchParameters: {},
        searchClient: makeClient(defaultResponse()),
      });

      const nextSearchState = {};

      ism.widgetsManager.registerWidget({
        transitionState: (nxt, current) => {
          expect(nxt).toEqual(nextSearchState);
          return { ...current, a: 1 };
        },
      });

      ism.widgetsManager.registerWidget({
        transitionState: (nxt, current) => {
          expect(nxt).toEqual(nextSearchState);
          return { ...current, b: 2 };
        },
      });

      const state = ism.transitionState();
      expect(state).toEqual({ a: 1, b: 2 });
    });
  });

  describe('getWidgetsIds', () => {
    it('returns the list of ids of all registered widgets', () => {
      const ism = createInstantSearchManager({
        indexName: 'index',
        initialState: {},
        searchParameters: {},
        searchClient: makeClient(defaultResponse()),
      });

      const widgetIDsT0 = ism.getWidgetsIds().sort();
      expect(widgetIDsT0).toEqual([]);

      ism.widgetsManager.registerWidget({ getMetadata: () => ({ id: 'a' }) });
      ism.widgetsManager.registerWidget({ getMetadata: () => ({ id: 'b' }) });
      ism.widgetsManager.registerWidget({ getMetadata: () => ({ id: 'c' }) });

      ism.widgetsManager.registerWidget({ getMetadata: () => ({ id: 'd' }) });

      return Promise.resolve().then(() => {
        const widgetIDsT1 = ism.getWidgetsIds().sort();
        expect(widgetIDsT1).toEqual(['a', 'b', 'c', 'd']);
      });
    });
  });

  describe('Loading state', () => {
    it('should be updated if search is stalled', () => {
      expect.assertions(10);

      const managedClient = makeManagedClient();
      const ism = createInstantSearchManager({
        indexName: 'index',
        initialState: {},
        searchParameters: {},
        searchClient: managedClient,
      });

      ism.widgetsManager.registerWidget({
        getMetadata: () => {},
        transitionState: () => {},
      });

      expect(managedClient.search).not.toHaveBeenCalled();
      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: true,
      });

      return Promise.resolve()
        .then(() => {
          expect(managedClient.search).toHaveBeenCalledTimes(1);

          expect(ism.store.getState()).toMatchObject({
            isSearchStalled: true,
          });

          jest.runAllTimers();

          expect(ism.store.getState()).toMatchObject({
            isSearchStalled: true,
          });

          return managedClient.searchResultsPromises[0];
        })
        .then(() => {
          expect(ism.store.getState()).toMatchObject({
            isSearchStalled: false,
          });

          ism.widgetsManager.update();

          expect(ism.store.getState()).toMatchObject({
            isSearchStalled: false,
          });

          return Promise.resolve();
        })
        .then(() => {
          expect(ism.store.getState()).toMatchObject({
            isSearchStalled: false,
          });

          jest.runAllTimers();

          expect(ism.store.getState()).toMatchObject({
            isSearchStalled: true,
          });

          return managedClient.searchResultsPromises[1];
        })
        .then(() => {
          expect(ism.store.getState()).toMatchObject({
            isSearchStalled: false,
          });
        });
    });
  });

  describe('client.search', () => {
    it('should be called when there is a new widget', () => {
      expect.assertions(2);

      const client0 = makeClient(defaultResponse());
      expect(client0.search).toHaveBeenCalledTimes(0);
      const ism = createInstantSearchManager({
        indexName: 'index',
        initialState: {},
        searchParameters: {},
        searchClient: client0,
      });

      ism.widgetsManager.registerWidget({
        getMetadata: () => {},
        transitionState: () => {},
      });

      return Promise.resolve().then(() => {
        expect(client0.search).toHaveBeenCalledTimes(1);
      });
    });

    it('should be called when there is a new client', () => {
      expect.assertions(4);

      const client0 = makeClient(defaultResponse());
      expect(client0.search).toHaveBeenCalledTimes(0);

      const ism = createInstantSearchManager({
        indexName: 'index',
        initialState: {},
        searchParameters: {},
        searchClient: client0,
      });

      const client1 = makeClient(defaultResponse());
      expect(client1.search).toHaveBeenCalledTimes(0);

      ism.updateClient(client1);

      return Promise.resolve().then(() => {
        expect(client0.search).toHaveBeenCalledTimes(0);
        expect(client1.search).toHaveBeenCalledTimes(1);
      });
    });
    it('should not be called when the search is skipped', () => {
      expect.assertions(2);

      const client0 = makeClient(defaultResponse());
      expect(client0.search).toHaveBeenCalledTimes(0);
      const ism = createInstantSearchManager({
        indexName: 'index',
        initialState: {},
        searchParameters: {},
        searchClient: client0,
      });

      ism.skipSearch();

      ism.widgetsManager.registerWidget({
        getMetadata: () => {},
        transitionState: () => {},
      });

      return Promise.resolve().then(() => {
        expect(client0.search).toHaveBeenCalledTimes(0);
      });
    });
  });
});

function makeClient(response) {
  const clientInstance = algoliaClient(
    'latency',
    '249078a3d4337a8231f1665ec5a44966'
  );
  clientInstance.search = jest.fn(() => {
    const clonedResponse = JSON.parse(JSON.stringify(response));
    return Promise.resolve(clonedResponse);
  });

  return clientInstance;
}

function makeManagedClient() {
  const searchResultsPromises = [];
  const fakeClient = {
    search: jest.fn(() => {
      const results = Promise.resolve(defaultResponse());
      searchResultsPromises.push(results);
      return results;
    }),
    searchResultsPromises,
  };

  return fakeClient;
}
