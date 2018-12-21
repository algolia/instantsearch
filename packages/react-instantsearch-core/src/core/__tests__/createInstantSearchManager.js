import createInstantSearchManager from '../createInstantSearchManager';

jest.useFakeTimers();

const runAllMicroTasks = () => new Promise(setImmediate);
const runOnlyNextMicroTask = () => Promise.resolve();

const createSearchClient = () => ({
  search: jest.fn(() =>
    Promise.resolve({
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
    })
  ),
});

describe('createInstantSearchManager', () => {
  it('initializes the manager with an empty state', () => {
    const ism = createInstantSearchManager({
      indexName: 'index',
      searchClient: createSearchClient(),
    });

    expect(ism.store.getState()).toEqual({
      error: null,
      isSearchStalled: true,
      metadata: [],
      results: null,
      searching: false,
      searchingForFacetValues: false,
      widgets: {},
    });

    expect(ism.widgetsManager.getWidgets()).toEqual([]);

    expect(ism.transitionState({})).toEqual({});

    expect(ism.getWidgetsIds()).toEqual([]);
  });

  it('initialize with results', () => {
    const ism = createInstantSearchManager({
      indexName: 'index',
      resultsState: { some: 'results' },
      searchClient: createSearchClient(),
    });

    expect(ism.store.getState()).toEqual({
      error: null,
      metadata: [],
      results: { some: 'results' },
      searching: false,
      searchingForFacetValues: false,
      widgets: {},
      isSearchStalled: true,
    });
  });

  describe('widget manager', () => {
    it('triggers a search when a widget is added', async () => {
      const searchClient = createSearchClient();

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.widgetsManager.registerWidget({
        getSearchParameters: () => ({}),
        props: {},
        context: {},
      });

      expect(ism.store.getState().searching).toBe(false);

      await runOnlyNextMicroTask();

      expect(ism.store.getState().searching).toBe(true);

      await runAllMicroTasks();

      expect(ism.store.getState().searching).toBe(false);
    });
  });

  describe('transitionState', () => {
    it('executes widgets hook', () => {
      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient(),
      });

      ism.widgetsManager.registerWidget({
        transitionState: (next, current) => {
          expect(next).toEqual({});

          return {
            ...current,
            a: 1,
          };
        },
      });

      ism.widgetsManager.registerWidget({
        transitionState: (next, current) => {
          expect(next).toEqual({});

          return {
            ...current,
            b: 2,
          };
        },
      });

      expect(ism.transitionState()).toEqual({
        a: 1,
        b: 2,
      });
    });
  });

  describe('getWidgetsIds', () => {
    it('returns the list of ids of all registered widgets', async () => {
      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient(),
      });

      expect(ism.getWidgetsIds()).toEqual([]);

      ism.widgetsManager.registerWidget({ getMetadata: () => ({ id: 'a' }) });
      ism.widgetsManager.registerWidget({ getMetadata: () => ({ id: 'b' }) });
      ism.widgetsManager.registerWidget({ getMetadata: () => ({ id: 'c' }) });
      ism.widgetsManager.registerWidget({ getMetadata: () => ({ id: 'd' }) });

      await runAllMicroTasks();

      expect(ism.getWidgetsIds()).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('searchStalled', () => {
    it('should be updated if search is stalled', async () => {
      const searchClient = createSearchClient();

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.widgetsManager.registerWidget({
        getMetadata: () => {},
        transitionState: () => {},
      });

      expect(searchClient.search).not.toHaveBeenCalled();
      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: true,
      });

      await runOnlyNextMicroTask();

      expect(searchClient.search).toHaveBeenCalledTimes(1);

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: true,
      });

      jest.runAllTimers();

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: true,
      });

      await runOnlyNextMicroTask();

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: false,
      });

      ism.widgetsManager.update();

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: false,
      });

      await runOnlyNextMicroTask();

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: false,
      });

      jest.runAllTimers();

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: true,
      });

      await runOnlyNextMicroTask();

      expect(ism.store.getState()).toMatchObject({
        isSearchStalled: false,
      });
    });
  });

  describe('client.search', () => {
    it('should be called when there is a new widget', async () => {
      const searchClient = createSearchClient();

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.widgetsManager.registerWidget({
        getMetadata: () => {},
        transitionState: () => {},
      });

      expect(searchClient.search).toHaveBeenCalledTimes(0);

      await runAllMicroTasks();

      expect(searchClient.search).toHaveBeenCalledTimes(1);
    });

    it('should be called when there is a new client', () => {
      const searchClient = createSearchClient();
      const nextSearchClient = createSearchClient();

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      expect(searchClient.search).toHaveBeenCalledTimes(0);
      expect(nextSearchClient.search).toHaveBeenCalledTimes(0);

      ism.updateClient(nextSearchClient);

      expect(searchClient.search).toHaveBeenCalledTimes(0);
      expect(nextSearchClient.search).toHaveBeenCalledTimes(1);
    });

    it('should not be called when the search is skipped', async () => {
      const searchClient = createSearchClient();

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient,
      });

      ism.skipSearch();

      ism.widgetsManager.registerWidget({
        getMetadata: () => {},
        transitionState: () => {},
      });

      await runAllMicroTasks();

      expect(searchClient.search).toHaveBeenCalledTimes(0);
    });
  });
});
