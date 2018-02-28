import algoliaClient from 'algoliasearch/lite';
import createInstantSearchManager from './createInstantSearchManager';

jest.useFakeTimers();

jest.mock('algoliasearch-helper/src/algoliasearch.helper.js', () => {
  const Helper = require.requireActual(
    'algoliasearch-helper/src/algoliasearch.helper.js'
  );
  Helper.prototype._dispatchAlgoliaResponse = function(state) {
    state.forEach(s => {
      this.emit(
        'result',
        { query: s.state.query, page: s.state.page, index: s.state.index },
        s
      );
    });
  };
  Helper.prototype.searchForFacetValues = () =>
    Promise.resolve({ facetHits: 'results' });
  return Helper;
});

const client = algoliaClient('latency', '249078a3d4337a8231f1665ec5a44966');
client.addAlgoliaAgent = () => {};
client.search = jest.fn((queries, cb) => {
  if (cb) {
    setImmediate(() => {
      // We do not care about the returned values because we also control how
      // it will handle in the helper
      cb(null, null);
    });
    return undefined;
  }

  return new Promise(resolve => {
    // cf comment above
    resolve(null);
  });
});

describe('createInstantSearchManager', () => {
  describe('with correct result from algolia', () => {
    describe('on widget lifecycle', () => {
      it('updates the store and searches', () => {
        const ism = createInstantSearchManager({
          indexName: 'first',
          initialState: {},
          searchParameters: {},
          algoliaClient: client,
        });

        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setQuery('first query 1'),
          context: {},
          props: {},
        });

        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setQuery('second query 1'),
          context: { multiIndexContext: { targetedIndex: 'second' } },
          props: {},
        });

        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setPage(3),
          context: { multiIndexContext: { targetedIndex: 'first' } },
          props: {},
        });

        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setIndex('second'),
          context: { multiIndexContext: { targetedIndex: 'second' } },
          props: { indexName: 'second' },
        });

        expect(ism.store.getState().results).toBe(null);

        return Promise.resolve().then(() => {
          jest.runAllTimers();

          const store = ism.store.getState();
          expect(store.results.first).toEqual({
            query: 'first query 1',
            page: 3,
            index: 'first',
          });
          expect(store.results.second).toEqual({
            query: 'second query 1',
            page: 0,
            index: 'second',
          });
          expect(store.error).toBe(null);

          ism.widgetsManager.getWidgets()[0].getSearchParameters = params =>
            params.setQuery('first query 2');
          ism.widgetsManager.getWidgets()[1].getSearchParameters = params =>
            params.setQuery('second query 2');

          ism.widgetsManager.update();

          return Promise.resolve().then(() => {
            jest.runAllTimers();

            const store1 = ism.store.getState();
            expect(store.results.first).toEqual({
              query: 'first query 2',
              page: 3,
              index: 'first',
            });
            expect(store.results.second).toEqual({
              query: 'second query 2',
              page: 0,
              index: 'second',
            });
            expect(store1.error).toBe(null);
          });
        });
      });

      it('updates the store and searches with duplicate Index & SortBy', () => {
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
          algoliaClient: client,
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

        ism.widgetsManager.update();

        return Promise.resolve().then(() => {
          jest.runAllTimers();

          expect(ism.store.getState().results).toEqual({
            first: {
              index: 'third',
              query: 'query',
              page: 0,
            },
            second: {
              index: 'second',
              query: 'query',
              page: 0,
            },
          });
        });
      });
    });

    describe('on external updates', () => {
      it('updates the store and searches', () => {
        const ism = createInstantSearchManager({
          indexName: 'first',
          initialState: {},
          searchParameters: {},
          algoliaClient: client,
        });

        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setQuery('first query 1'),
          context: {},
          props: {},
        });
        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setQuery('second query 1'),
          context: { multiIndexContext: { targetedIndex: 'second' } },
          props: {},
        });
        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setPage(3),
          context: { multiIndexContext: { targetedIndex: 'first' } },
          props: {},
        });
        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setIndex('second'),
          context: { multiIndexContext: { targetedIndex: 'second' } },
          props: { indexName: 'second' },
        });

        ism.onExternalStateUpdate({});

        expect(ism.store.getState().results).toBe(null);

        jest.runAllTimers();

        const store = ism.store.getState();
        expect(store.results.first).toEqual({
          query: 'first query 1',
          page: 3,
          index: 'first',
        });
        expect(store.results.second).toEqual({
          query: 'second query 1',
          page: 0,
          index: 'second',
        });
        expect(store.error).toBe(null);
      });
      it('updates the store and searches when switching from mono to multi index', () => {
        const ism = createInstantSearchManager({
          indexName: 'first',
          initialState: {},
          searchParameters: {},
          algoliaClient: client,
        });

        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setQuery('first query 1'),
          context: {},
          props: {},
        });
        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setQuery('second query 1'),
          context: { multiIndexContext: { targetedIndex: 'second' } },
          props: {},
        });
        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setPage(3),
          context: { multiIndexContext: { targetedIndex: 'first' } },
          props: {},
        });
        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setIndex('second'),
          context: { multiIndexContext: { targetedIndex: 'second' } },
          props: { indexName: 'second' },
        });

        ism.onExternalStateUpdate({});

        expect(ism.store.getState().results).toBe(null);

        jest.runAllTimers();

        let store = ism.store.getState();
        expect(store.results.first).toEqual({
          query: 'first query 1',
          page: 3,
          index: 'first',
        });
        expect(store.results.second).toEqual({
          query: 'second query 1',
          page: 0,
          index: 'second',
        });
        expect(store.error).toBe(null);

        ism.widgetsManager.getWidgets()[0].getSearchParameters = params =>
          params.setQuery('first query 2');
        ism.widgetsManager.getWidgets().pop();
        ism.widgetsManager.getWidgets().pop();
        ism.widgetsManager.getWidgets().pop();

        ism.onExternalStateUpdate({});

        jest.runAllTimers();

        store = ism.store.getState();
        expect(store.results).toEqual({
          query: 'first query 2',
          page: 0,
          index: 'first',
        });

        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setQuery('second query 2'),
          context: { multiIndexContext: { targetedIndex: 'second' } },
          props: {},
        });
        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setPage(3),
          context: { multiIndexContext: { targetedIndex: 'first' } },
          props: {},
        });
        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setIndex('second'),
          context: { multiIndexContext: { targetedIndex: 'second' } },
          props: {},
        });

        ism.onExternalStateUpdate({});

        jest.runAllTimers();

        store = ism.store.getState();
        expect(store.results.first).toEqual({
          query: 'first query 2',
          page: 3,
          index: 'first',
        });
        expect(store.results.second).toEqual({
          query: 'second query 2',
          page: 0,
          index: 'second',
        });
      });
    });
  });
});
