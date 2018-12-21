import createInstantSearchManager from '../createInstantSearchManager';

const flushPendingMicroTasks = () => new Promise(setImmediate);

const createSearchClient = () => ({
  search(requests) {
    return Promise.resolve({
      results: requests.map(request => ({
        index: request.indexName,
        query: request.params.query,
        page: request.params.page,
        hits: [],
      })),
    });
  },
  searchForFacetValues() {
    return Promise.resolve([
      {
        facetHits: [],
      },
    ]);
  },
});

describe('createInstantSearchManager with multi index', () => {
  it('updates the store and searches', async () => {
    // <InstantSearch indexName="first">
    //   <SearchBox defaultRefinement="first query 1" />
    //
    //   <Index indexName="first">
    //     <Pagination defaultRefinement={3} />
    //   </Index>
    //
    //   <Index indexName="second">
    //     <SearchBox defaultRefinement="second query 1" />
    //   </Index>
    // </InstantSearch>

    const ism = createInstantSearchManager({
      indexName: 'first',
      initialState: {},
      searchParameters: {},
      searchClient: createSearchClient(),
    });

    // <SearchBox defaultRefinement="first query 1" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setQuery('first query 1'),
      context: {},
      props: {},
    });

    // <Index indexName="first" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('first'),
      context: {},
      props: {
        indexName: 'first',
      },
    });

    // <Index indexName="first">
    //   <Pagination defaultRefinement={3} />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setPage(3),
      context: { multiIndexContext: { targetedIndex: 'first' } },
      props: {},
    });

    // <Index indexName="second" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('second'),
      context: {},
      props: {
        indexName: 'second',
      },
    });

    // <Index indexName="second">
    //   <SearchBox defaultRefinement="second query 1" />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setQuery('second query 1'),
      context: { multiIndexContext: { targetedIndex: 'second' } },
      props: {},
    });

    expect(ism.store.getState().results).toBe(null);

    await flushPendingMicroTasks();

    expect(ism.store.getState().results.first).toEqual(
      expect.objectContaining({
        query: 'first query 1',
        index: 'first',
        page: 3,
      })
    );

    expect(ism.store.getState().results.second).toEqual(
      expect.objectContaining({
        query: 'second query 1',
        index: 'second',
        page: 0,
      })
    );

    await flushPendingMicroTasks();

    // <SearchBox defaultRefinement="first query 2" />
    ism.widgetsManager.getWidgets()[0].getSearchParameters = params =>
      params.setQuery('first query 2');

    // <Index indexName="second">
    //   <SearchBox defaultRefinement="second query 2" />
    // </Index>
    ism.widgetsManager.getWidgets()[4].getSearchParameters = params =>
      params.setQuery('second query 2');

    // Simualte an udpate (see `createConnector`)
    ism.widgetsManager.update();

    await flushPendingMicroTasks();

    expect(ism.store.getState().results.first).toEqual(
      expect.objectContaining({
        query: 'first query 2',
        index: 'first',
        page: 3,
      })
    );

    expect(ism.store.getState().results.second).toEqual(
      expect.objectContaining({
        query: 'second query 2',
        index: 'second',
        page: 0,
      })
    );
  });

  it('searches with duplicate Index & SortBy', async () => {
    // <InstantSearch indexName="first">
    //   <SearchBox defaultRefinement="query" />
    //
    //   <Index indexName="first">
    //     <SortBy defaultRefinement="third" />
    //   </Index>
    //
    //   <Index indexName="second" />
    // </InstantSearch>;

    const ism = createInstantSearchManager({
      indexName: 'first',
      initialState: {},
      searchParameters: {},
      searchClient: createSearchClient(),
    });

    // <SearchBox defaultRefinement="query" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setQuery('query'),
      context: {},
      props: {},
    });

    // <Index indexName="first" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: x => x.setIndex('first'),
      context: {},
      props: {
        indexName: 'first',
      },
    });

    // <Index indexName="first">
    //   <SortBy defaultRefinement="third" />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: x => x.setIndex('third'),
      context: { multiIndexContext: { targetedIndex: 'first' } },
      props: {},
    });

    // <Index indexName="second" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: x => x.setIndex('second'),
      context: {},
      props: {
        indexName: 'second',
      },
    });

    expect(ism.store.getState().results).toBe(null);

    await flushPendingMicroTasks();

    expect(ism.store.getState().results.first).toEqual(
      expect.objectContaining({
        index: 'third',
        query: 'query',
        page: 0,
      })
    );

    expect(ism.store.getState().results.second).toEqual(
      expect.objectContaining({
        index: 'second',
        query: 'query',
        page: 0,
      })
    );
  });

  it('switching from mono to multi index', async () => {
    // <InstantSearch indexName="first">
    //   <SearchBox defaultRefinement="first query 1" />
    //
    //   <Index indexName="first">
    //     <Pagination defaultRefinement={3} />
    //   </Index>
    //
    //   <Index indexName="second">
    //     <SearchBox defaultRefinement="second query 1" />
    //   </Index>
    // </InstantSearch>

    const ism = createInstantSearchManager({
      indexName: 'first',
      initialState: {},
      searchParameters: {},
      searchClient: createSearchClient(),
    });

    // <SearchBox defaultRefinement="first query 1" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setQuery('first query 1'),
      context: {},
      props: {},
    });

    // <Index indexName="first" />
    const unregisterFirstIndexWidget = ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('first'),
      context: {},
      props: {
        indexName: 'first',
      },
    });

    // <Index indexName="first">
    //   <Pagination defaultRefinement={3} />
    // </Index>
    const unregisterPaginationWidget = ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setPage(3),
      context: { multiIndexContext: { targetedIndex: 'first' } },
      props: {},
    });

    // <Index indexName="second" />
    const unregisterSecondIndexWidget = ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('second'),
      context: {},
      props: {
        indexName: 'second',
      },
    });

    // <Index indexName="second">
    //   <SearchBox defaultRefinement="second query 1" />
    // </Index>
    const unregisterSecondSearchBoxWidget = ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setQuery('second query 1'),
      context: { multiIndexContext: { targetedIndex: 'second' } },
      props: {},
    });

    expect(ism.store.getState().results).toBe(null);

    await flushPendingMicroTasks();

    expect(ism.store.getState().results.first).toEqual(
      expect.objectContaining({
        index: 'first',
        query: 'first query 1',
        page: 3,
      })
    );

    expect(ism.store.getState().results.second).toEqual(
      expect.objectContaining({
        index: 'second',
        query: 'second query 1',
        page: 0,
      })
    );

    ism.widgetsManager.getWidgets()[0].getSearchParameters = params =>
      params.setQuery('first query 2');

    unregisterFirstIndexWidget();
    unregisterPaginationWidget();
    unregisterSecondIndexWidget();
    unregisterSecondSearchBoxWidget();

    await flushPendingMicroTasks();

    expect(ism.store.getState().results).toEqual(
      expect.objectContaining({
        index: 'first',
        query: 'first query 2',
        page: 0,
      })
    );

    // <Index indexName="first" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('first'),
      context: {},
      props: {
        indexName: 'first',
      },
    });

    // <Index indexName="first">
    //   <Pagination defaultRefinement={3} />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setPage(3),
      context: { multiIndexContext: { targetedIndex: 'first' } },
      props: {},
    });

    // <Index indexName="second" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('second'),
      context: {},
      props: {
        indexName: 'second',
      },
    });

    // <Index indexName="second">
    //   <SearchBox defaultRefinement="second query 1" />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setQuery('second query 2'),
      context: { multiIndexContext: { targetedIndex: 'second' } },
      props: {},
    });

    await flushPendingMicroTasks();

    expect(ism.store.getState().results.first).toEqual(
      expect.objectContaining({
        index: 'first',
        query: 'first query 2',
        page: 3,
      })
    );

    expect(ism.store.getState().results.second).toEqual(
      expect.objectContaining({
        index: 'second',
        query: 'second query 2',
        page: 0,
      })
    );
  });
});
