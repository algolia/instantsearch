import createInstantSearchManager from '../createInstantSearchManager';

const runAllMicroTasks = () => new Promise(setImmediate);

const createSearchClient = () => ({
  search: jest.fn(requests =>
    Promise.resolve({
      results: requests.map(request => ({
        index: request.indexName,
        query: request.params.query,
        page: request.params.page,
        hitsPerPage: request.params.hitsPerPage,
        hits: [],
      })),
    })
  ),
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
    //   <Index indexName="first" indexId="first">
    //     <Pagination defaultRefinement={3} />
    //   </Index>
    //
    //   <Index indexName="second" indexId="second">
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

    // <Index indexName="first" indexId="first" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('first'),
      context: {},
      props: {
        indexName: 'first',
        indexId: 'first',
      },
    });

    // <Index indexName="first" indexId="first">
    //   <Pagination defaultRefinement={3} />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setPage(3),
      context: {
        multiIndexContext: {
          targetedIndex: 'first',
        },
      },
      props: {},
    });

    // <Index indexName="second" indexId="second" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('second'),
      context: {},
      props: {
        indexName: 'second',
        indexId: 'second',
      },
    });

    // <Index indexName="second" indexId="second">
    //   <SearchBox defaultRefinement="second query 1" />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setQuery('second query 1'),
      context: {
        multiIndexContext: {
          targetedIndex: 'second',
        },
      },
      props: {},
    });

    expect(ism.store.getState().results).toBe(null);

    await runAllMicroTasks();

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

    await runAllMicroTasks();

    // <SearchBox defaultRefinement="first query 2" />
    ism.widgetsManager.getWidgets()[0].getSearchParameters = params =>
      params.setQuery('first query 2');

    // <Index indexName="second" indexId="second">
    //   <SearchBox defaultRefinement="second query 2" />
    // </Index>
    ism.widgetsManager.getWidgets()[4].getSearchParameters = params =>
      params.setQuery('second query 2');

    ism.widgetsManager.update();

    await runAllMicroTasks();

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
    //   <Index indexName="first" indexId="first">
    //     <SortBy defaultRefinement="third" />
    //   </Index>
    //
    //   <Index indexName="second" indexId="second" />
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

    // <Index indexName="first" indexId="first" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: x => x.setIndex('first'),
      context: {},
      props: {
        indexName: 'first',
        indexId: 'first',
      },
    });

    // <Index indexName="first" indexId="first">
    //   <SortBy defaultRefinement="third" />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: x => x.setIndex('third'),
      context: {
        multiIndexContext: {
          targetedIndex: 'first',
        },
      },
      props: {},
    });

    // <Index indexName="second" indexId="second" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: x => x.setIndex('second'),
      context: {},
      props: {
        indexName: 'second',
        indexId: 'second',
      },
    });

    expect(ism.store.getState().results).toBe(null);

    await runAllMicroTasks();

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

  it('searches with N queries for N Index widgets', async () => {
    // <InstantSearch indexName="first">
    //   <Index indexName="first" />
    //   <Index indexName="second" />
    //   <Index indexName="third" />
    //   <Index indexName="four" />
    // </InstantSearch>;

    const searchClient = createSearchClient();

    const ism = createInstantSearchManager({
      indexName: 'first',
      initialState: {},
      searchParameters: {},
      searchClient,
    });

    // <Index indexName="first" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: x => x.setIndex('first'),
      context: {},
      props: {
        indexName: 'first',
        indexId: 'first',
      },
    });

    // <Index indexName="second" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: x => x.setIndex('second'),
      context: {},
      props: {
        indexName: 'second',
        indexId: 'second',
      },
    });

    // <Index indexName="third" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: x => x.setIndex('third'),
      context: {},
      props: {
        indexName: 'third',
        indexId: 'third',
      },
    });

    // <Index indexName="four" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: x => x.setIndex('four'),
      context: {},
      props: {
        indexName: 'four',
        indexId: 'four',
      },
    });

    await runAllMicroTasks();

    expect(searchClient.search.mock.calls[0][0]).toHaveLength(4);

    ism.widgetsManager.update();

    await runAllMicroTasks();

    expect(searchClient.search.mock.calls[1][0]).toHaveLength(4);
  });

  it('searches with same index but different params', async () => {
    // <InstantSearch indexName="first">
    //   <SearchBox defaultRefinement="first query" />
    //
    //   <Index indexName="first" indexId="first_5_hits">
    //     <Configure hitsPerPage={5} />
    //   </Index>
    //
    //   <Index indexName="first" indexId="first_10_hits">
    //     <Configure hitsPerPage={10} />
    //   </Index>
    // </InstantSearch>

    const ism = createInstantSearchManager({
      indexName: 'first',
      initialState: {},
      searchParameters: {},
      searchClient: createSearchClient(),
    });

    // <SearchBox defaultRefinement="first query" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setQuery('first query'),
      context: {},
      props: {},
    });

    // <Index indexName="first" indexId="first_5_hits" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('first'),
      context: {},
      props: {
        indexName: 'first',
        indexId: 'first_5_hits',
      },
    });

    // <Index indexName="first" indexId="first_5_hits">
    //   <Configure hitsPerPage={5} />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setQueryParameter('hitsPerPage', 5),
      context: {
        multiIndexContext: {
          targetedIndex: 'first_5_hits',
        },
      },
      props: {},
    });

    // <Index indexName="first" indexId="first_10_hits" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('first'),
      context: {},
      props: {
        indexName: 'first',
        indexId: 'first_10_hits',
      },
    });

    // <Index indexName="first" indexId="first_10_hits">
    //   <Configure hitsPerPage={10} />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: params =>
        params.setQueryParameter('hitsPerPage', 10),
      context: {
        multiIndexContext: {
          targetedIndex: 'first_10_hits',
        },
      },
      props: {},
    });

    expect(ism.store.getState().results).toBe(null);

    await runAllMicroTasks();

    expect(ism.store.getState().results.first_5_hits).toEqual(
      expect.objectContaining({
        query: 'first query',
        index: 'first',
        hitsPerPage: 5,
      })
    );

    expect(ism.store.getState().results.first_10_hits).toEqual(
      expect.objectContaining({
        query: 'first query',
        index: 'first',
        hitsPerPage: 10,
      })
    );
  });

  it('switching from mono to multi index', async () => {
    // <InstantSearch indexName="first">
    //   <SearchBox defaultRefinement="first query 1" />
    //
    //   <Index indexName="first" indexId="first">
    //     <Pagination defaultRefinement={3} />
    //   </Index>
    //
    //   <Index indexName="second" indexId="second">
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

    // <Index indexName="first" indexId="first" />
    const unregisterFirstIndexWidget = ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('first'),
      context: {},
      props: {
        indexName: 'first',
        indexId: 'first',
      },
    });

    // <Index indexName="first" indexId="first">
    //   <Pagination defaultRefinement={3} />
    // </Index>
    const unregisterPaginationWidget = ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setPage(3),
      context: {
        multiIndexContext: {
          targetedIndex: 'first',
        },
      },
      props: {},
    });

    // <Index indexName="second" indexId="second" />
    const unregisterSecondIndexWidget = ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('second'),
      context: {},
      props: {
        indexName: 'second',
        indexId: 'second',
      },
    });

    // <Index indexName="second" indexId="second">
    //   <SearchBox defaultRefinement="second query 1" />
    // </Index>
    const unregisterSecondSearchBoxWidget = ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setQuery('second query 1'),
      context: {
        multiIndexContext: {
          targetedIndex: 'second',
        },
      },
      props: {},
    });

    expect(ism.store.getState().results).toBe(null);

    await runAllMicroTasks();

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

    await runAllMicroTasks();

    expect(ism.store.getState().results).toEqual(
      expect.objectContaining({
        index: 'first',
        query: 'first query 2',
        page: 0,
      })
    );

    // <Index indexName="first" indexId="first" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('first'),
      context: {},
      props: {
        indexName: 'first',
        indexId: 'first',
      },
    });

    // <Index indexName="first" indexId="first">
    //   <Pagination defaultRefinement={3} />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setPage(3),
      context: {
        multiIndexContext: {
          targetedIndex: 'first',
        },
      },
      props: {},
    });

    // <Index indexName="second" indexId="second" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setIndex('second'),
      context: {},
      props: {
        indexName: 'second',
        indexId: 'second',
      },
    });

    // <Index indexName="second" indexId="second">
    //   <SearchBox defaultRefinement="second query 1" />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: params => params.setQuery('second query 2'),
      context: {
        multiIndexContext: {
          targetedIndex: 'second',
        },
      },
      props: {},
    });

    await runAllMicroTasks();

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
