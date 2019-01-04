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

  it('initializes with results', () => {
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

  describe('getSearchParameters', () => {
    it('expects a widget top level to be shared between main and derived parameters', () => {
      // <InstantSearch indexName="index">
      //   <SearchBox defaultRefinement="shared" />
      //   <Index indexId="main" indexName="main" />
      // </InstantSearch>

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient(),
      });

      // <SearchBox defaultRefinement="shared" />
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setQuery('shared');
        },
        context: {},
        props: {},
      });

      // <Index indexId="main" indexName="main" />
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setIndex('main');
        },
        props: {
          indexId: 'main',
        },
      });

      const { mainParameters, derivedParameters } = ism.getSearchParameters();

      expect(mainParameters).toEqual(
        expect.objectContaining({
          index: 'index',
          query: 'shared',
        })
      );

      expect(derivedParameters).toEqual([
        {
          indexId: 'main',
          parameters: expect.objectContaining({
            index: 'main',
            query: 'shared',
          }),
        },
      ]);
    });

    it('expects a widget with the same id than the indexName to be a main parameters', () => {
      // <InstantSearch indexName="index">
      //   <Index indexId="index" indexName="main" />
      // </InstantSearch>

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient(),
      });

      // <Index indexId="index" indexName="main" />
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setIndex('main');
        },
        context: {},
        props: {
          indexId: 'index',
        },
      });

      const { mainParameters, derivedParameters } = ism.getSearchParameters();

      expect(mainParameters).toEqual(
        expect.objectContaining({
          index: 'main',
        })
      );

      expect(derivedParameters).toEqual([]);
    });

    it('expects a widget with a different id than the indexName to be a derived parameters', () => {
      // <InstantSearch indexName="index">
      //   <Index indexId="index_main" indexName="main" />
      // </InstantSearch>

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient(),
      });

      // <Index indexId="index_main" indexName="main" />
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setIndex('main');
        },
        context: {},
        props: {
          indexId: 'index_main',
        },
      });

      const { mainParameters, derivedParameters } = ism.getSearchParameters();

      expect(mainParameters).toEqual(
        expect.objectContaining({
          index: 'index',
        })
      );

      expect(derivedParameters).toEqual([
        {
          indexId: 'index_main',
          parameters: expect.objectContaining({
            index: 'main',
          }),
        },
      ]);
    });

    it('expects a widget within a mutli index context with the same id than the indexName to be a main parameters', () => {
      // <InstantSearch indexName="index">
      //   <Index indexId="index" indexName="index" />
      //     <SearchBox defaultRefinement="main" />
      //   </Index>
      // </InstantSearch>

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient(),
      });

      // <Index indexId="index" indexName="index" />
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setIndex('index');
        },
        context: {},
        props: {
          indexId: 'index',
        },
      });

      // <Index indexId="index" indexName="index" />
      //   <SearchBox defaultRefinement="main" />
      // </Index>
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setQuery('main');
        },
        context: {
          multiIndexContext: {
            targetedIndex: 'index',
          },
        },
        props: {},
      });

      const { mainParameters, derivedParameters } = ism.getSearchParameters();

      expect(mainParameters).toEqual(
        expect.objectContaining({
          index: 'index',
          query: 'main',
        })
      );

      expect(derivedParameters).toEqual([]);
    });

    it('expects a widget within a mutli index context with a different id than the indexName to be a derived parameters', () => {
      // <InstantSearch indexName="index">
      //   <Index indexId="index_with_refinement" indexName="index" />
      //     <SearchBox defaultRefinement="dervied" />
      //   </Index>
      // </InstantSearch>

      const ism = createInstantSearchManager({
        indexName: 'index',
        searchClient: createSearchClient(),
      });

      // <Index indexId="index_with_refinement" indexName="index" />
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setIndex('index');
        },
        context: {},
        props: {
          indexId: 'index_with_refinement',
        },
      });

      // <Index indexId="index_with_refinement" indexName="index" />
      //   <SearchBox defaultRefinement="derived" />
      // </Index>
      ism.widgetsManager.registerWidget({
        getSearchParameters(state) {
          return state.setQuery('derived');
        },
        context: {
          multiIndexContext: {
            targetedIndex: 'index_with_refinement',
          },
        },
        props: {},
      });

      const { mainParameters, derivedParameters } = ism.getSearchParameters();

      expect(mainParameters).toEqual(
        expect.objectContaining({
          index: 'index',
          query: '',
        })
      );

      expect(derivedParameters).toEqual([
        {
          indexId: 'index_with_refinement',
          parameters: expect.objectContaining({
            index: 'index',
            query: 'derived',
          }),
        },
      ]);
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
