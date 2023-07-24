import { wait } from '@instantsearch/testutils';

import createInstantSearchManager from '../createInstantSearchManager';

const createSearchClient = () => ({
  search: jest.fn((requests) =>
    Promise.resolve({
      results: requests.map(
        ({ indexName, params: { page, query, hitsPerPage } }) => ({
          index: indexName,
          query,
          page,
          hitsPerPage,
          hits: [],
        })
      ),
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
      searchClient: createSearchClient({}),
    });

    // <SearchBox defaultRefinement="first query 1" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setQuery('first query 1'),
      props: {},
    });

    // <Index indexName="first" indexId="first" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setIndex('first'),
      props: {
        indexName: 'first',
        indexId: 'first',
      },
    });

    // <Index indexName="first" indexId="first">
    //   <Pagination defaultRefinement={3} />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setPage(3),
      props: {
        indexContextValue: {
          targetedIndex: 'first',
        },
      },
    });

    // <Index indexName="second" indexId="second" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setIndex('second'),
      props: {
        indexName: 'second',
        indexId: 'second',
      },
    });

    // <Index indexName="second" indexId="second">
    //   <SearchBox defaultRefinement="second query 1" />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setQuery('second query 1'),
      props: {
        indexContextValue: {
          targetedIndex: 'second',
        },
      },
    });

    expect(ism.store.getState().results).toBe(null);

    await wait(0);

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
      })
    );

    await wait(0);

    // <SearchBox defaultRefinement="first query 2" />
    ism.widgetsManager.getWidgets()[0].getSearchParameters = (params) =>
      params.setQuery('first query 2');

    // <Index indexName="second" indexId="second">
    //   <SearchBox defaultRefinement="second query 2" />
    // </Index>
    ism.widgetsManager.getWidgets()[4].getSearchParameters = (params) =>
      params.setQuery('second query 2');

    ism.widgetsManager.update();

    await wait(0);

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
      })
    );
  });

  // https://github.com/algolia/react-instantsearch/issues/2875
  it('update resultsState without mutate object', async () => {
    const ism = createInstantSearchManager({
      indexName: 'first',
      initialState: {},
      searchParameters: {},
      searchClient: createSearchClient({}),
    });

    // <SearchBox defaultRefinement="first query 1" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setQuery('first query 1'),
      props: {},
    });

    // <Index indexName="first" indexId="first" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setIndex('first'),
      props: {
        indexName: 'first',
        indexId: 'first',
      },
    });

    // <Index indexName="first" indexId="first">
    //   <Pagination defaultRefinement={3} />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setPage(3),
      props: {
        indexContextValue: {
          targetedIndex: 'first',
        },
      },
    });

    // <Index indexName="second" indexId="second" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setIndex('second'),
      props: {
        indexName: 'second',
        indexId: 'second',
      },
    });

    // <Index indexName="second" indexId="second">
    //   <SearchBox defaultRefinement="second query 1" />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setQuery('second query 1'),
      props: {
        indexContextValue: {
          targetedIndex: 'second',
        },
      },
    });

    expect(ism.store.getState().results).toBe(null);

    await wait(0);

    const resultsWithFirstAndSecond = ism.store.getState().results;

    // <Index indexName="thrid" indexId="thrid" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setIndex('thrid'),
      props: {
        indexName: 'thrid',
        indexId: 'thrid',
      },
    });

    // <Index indexName="thrid" indexId="thrid">
    //   <SearchBox defaultRefinement="thrid query 1" />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setQuery('thrid query 1'),
      props: {
        indexContextValue: {
          targetedIndex: 'thrid',
        },
      },
    });

    await wait(0);

    expect(
      Object.is(resultsWithFirstAndSecond, ism.store.getState().results)
    ).toBe(false);
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
      searchClient: createSearchClient({}),
    });

    // <SearchBox defaultRefinement="query" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setQuery('query'),
      props: {},
    });

    // <Index indexName="first" indexId="first" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (x) => x.setIndex('first'),
      props: {
        indexName: 'first',
        indexId: 'first',
      },
    });

    // <Index indexName="first" indexId="first">
    //   <SortBy defaultRefinement="third" />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: (x) => x.setIndex('third'),
      props: {
        indexContextValue: {
          targetedIndex: 'first',
        },
      },
    });

    // <Index indexName="second" indexId="second" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (x) => x.setIndex('second'),
      props: {
        indexName: 'second',
        indexId: 'second',
      },
    });

    expect(ism.store.getState().results).toBe(null);

    await wait(0);

    expect(ism.store.getState().results.first).toEqual(
      expect.objectContaining({
        index: 'third',
        query: 'query',
      })
    );

    expect(ism.store.getState().results.second).toEqual(
      expect.objectContaining({
        index: 'second',
        query: 'query',
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

    const searchClient = createSearchClient({});

    const ism = createInstantSearchManager({
      indexName: 'first',
      initialState: {},
      searchParameters: {},
      searchClient,
    });

    // <Index indexName="first" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (x) => x.setIndex('first'),
      props: {
        indexName: 'first',
        indexId: 'first',
      },
    });

    // <Index indexName="second" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (x) => x.setIndex('second'),
      props: {
        indexName: 'second',
        indexId: 'second',
      },
    });

    // <Index indexName="third" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (x) => x.setIndex('third'),
      props: {
        indexName: 'third',
        indexId: 'third',
      },
    });

    // <Index indexName="four" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (x) => x.setIndex('four'),
      props: {
        indexName: 'four',
        indexId: 'four',
      },
    });

    await wait(0);

    expect(searchClient.search.mock.calls[0][0]).toHaveLength(4);

    ism.widgetsManager.update();

    await wait(0);

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
      searchClient: createSearchClient({}),
    });

    // <SearchBox defaultRefinement="first query" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setQuery('first query'),
      context: {},
      props: {},
    });

    // <Index indexName="first" indexId="first_5_hits" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setIndex('first'),
      props: {
        indexName: 'first',
        indexId: 'first_5_hits',
      },
    });

    // <Index indexName="first" indexId="first_5_hits">
    //   <Configure hitsPerPage={5} />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) =>
        params.setQueryParameter('hitsPerPage', 5),
      props: {
        indexContextValue: {
          targetedIndex: 'first_5_hits',
        },
      },
    });

    // <Index indexName="first" indexId="first_10_hits" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setIndex('first'),
      props: {
        indexName: 'first',
        indexId: 'first_10_hits',
      },
    });

    // <Index indexName="first" indexId="first_10_hits">
    //   <Configure hitsPerPage={10} />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) =>
        params.setQueryParameter('hitsPerPage', 10),
      props: {
        indexContextValue: {
          targetedIndex: 'first_10_hits',
        },
      },
    });

    expect(ism.store.getState().results).toBe(null);

    await wait(0);

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
      searchClient: createSearchClient({}),
    });

    // <SearchBox defaultRefinement="first query 1" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setQuery('first query 1'),
      props: {},
    });

    // <Index indexName="first" indexId="first" />
    const unregisterFirstIndexWidget = ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setIndex('first'),
      props: {
        indexName: 'first',
        indexId: 'first',
      },
    });

    // <Index indexName="first" indexId="first">
    //   <Pagination defaultRefinement={3} />
    // </Index>
    const unregisterPaginationWidget = ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setPage(3),
      props: {
        indexContextValue: {
          targetedIndex: 'first',
        },
      },
    });

    // <Index indexName="second" indexId="second" />
    const unregisterSecondIndexWidget = ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setIndex('second'),
      props: {
        indexName: 'second',
        indexId: 'second',
      },
    });

    // <Index indexName="second" indexId="second">
    //   <SearchBox defaultRefinement="second query 1" />
    // </Index>
    const unregisterSecondSearchBoxWidget = ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setQuery('second query 1'),
      props: {
        indexContextValue: {
          targetedIndex: 'second',
        },
      },
    });

    expect(ism.store.getState().results).toBe(null);

    await wait(0);

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
      })
    );

    ism.widgetsManager.getWidgets()[0].getSearchParameters = (params) =>
      params.setQuery('first query 2');

    unregisterFirstIndexWidget();
    unregisterPaginationWidget();
    unregisterSecondIndexWidget();
    unregisterSecondSearchBoxWidget();

    await wait(0);

    expect(ism.store.getState().results).toEqual(
      expect.objectContaining({
        index: 'first',
        query: 'first query 2',
      })
    );

    // <Index indexName="first" indexId="first" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setIndex('first'),
      props: {
        indexName: 'first',
        indexId: 'first',
      },
    });

    // <Index indexName="first" indexId="first">
    //   <Pagination defaultRefinement={3} />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setPage(3),
      props: {
        indexContextValue: {
          targetedIndex: 'first',
        },
      },
    });

    // <Index indexName="second" indexId="second" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setIndex('second'),
      props: {
        indexName: 'second',
        indexId: 'second',
      },
    });

    // <Index indexName="second" indexId="second">
    //   <SearchBox defaultRefinement="second query 1" />
    // </Index>
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setQuery('second query 2'),
      props: {
        indexContextValue: {
          targetedIndex: 'second',
        },
      },
    });

    await wait(0);

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
      })
    );
  });

  it('sets state with correct value for `searching` property', async () => {
    // <InstantSearch indexName="first">
    //   <Index indexName="first" />
    //   <Index indexName="second" />
    //   <Index indexName="third" />
    // </InstantSearch>;

    const searchClient = createSearchClient({});

    const ism = createInstantSearchManager({
      indexName: 'first',
      initialState: {},
      searchParameters: {},
      searchClient,
    });

    // <SearchBox defaultRefinement="first query 1" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (params) => params.setQuery('first query 1'),
      props: {},
    });

    // <Index indexName="first" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (x) => x.setIndex('first'),
      props: {
        indexName: 'first',
        indexId: 'first',
      },
    });

    // <Index indexName="second" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (x) => x.setIndex('second'),
      props: {
        indexName: 'second',
        indexId: 'second',
      },
    });

    // <Index indexName="third" />
    ism.widgetsManager.registerWidget({
      getSearchParameters: (x) => x.setIndex('third'),
      props: {
        indexName: 'third',
        indexId: 'third',
      },
    });

    const setStateSpy = jest.spyOn(ism.store, 'setState');

    await wait(0);

    expect(setStateSpy.mock.calls).toHaveLength(4);
    expect(setStateSpy.mock.calls[0][0]).toEqual(
      expect.objectContaining({ searching: true })
    );
    expect(setStateSpy.mock.calls[1][0]).toEqual(
      expect.objectContaining({ searching: true })
    );
    expect(setStateSpy.mock.calls[2][0]).toEqual(
      expect.objectContaining({ searching: true })
    );
    expect(setStateSpy.mock.calls[3][0]).toEqual(
      expect.objectContaining({ searching: false })
    );
  });
});
