import algoliaClient from 'algoliasearch/lite';
import jsHepler from 'algoliasearch-helper';
import createInstantSearchManager from './createInstantSearchManager';

jest.useFakeTimers();

// We should avoid to rely on such mock, we do crazy stuff in order to have access
// to the instance. An easier way is to pass the helper as an argument of the manager
// with the default implementation as default value. With this change we can easily
// pass a custom helper (mock or not).
jest.mock('algoliasearch-helper', () => {
  const actualJsHelper = require.requireActual('algoliasearch-helper');
  const proxifyJsHelper = jest.fn((...args) => actualJsHelper(...args));

  Object.keys(actualJsHelper).forEach(key => {
    proxifyJsHelper[key] = actualJsHelper[key];
  });

  return proxifyJsHelper;
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
        const _dispatchAlgoliaResponse = jest.fn(function(state) {
          this.emit('result', { value: 'results' }, state);
        });

        jsHepler.mockImplementationOnce((...args) => {
          const instance = jsHepler(...args);

          instance._dispatchAlgoliaResponse = _dispatchAlgoliaResponse;

          return instance;
        });

        const ism = createInstantSearchManager({
          indexName: 'index',
          initialState: {},
          searchParameters: {},
          algoliaClient: client,
        });

        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setQuery('search'),
          props: {},
          context: {},
        });

        expect(ism.store.getState().results).toBe(null);

        return Promise.resolve()
          .then(() => {
            jest.runAllTimers();

            const store = ism.store.getState();
            expect(_dispatchAlgoliaResponse).toHaveBeenCalledTimes(1);
            expect(store.results).toEqual({ value: 'results' });
            expect(store.error).toBe(null);

            ism.widgetsManager.update();
          })
          .then(() => {
            jest.runAllTimers();

            const store = ism.store.getState();
            expect(_dispatchAlgoliaResponse).toHaveBeenCalledTimes(2);
            expect(store.results).toEqual({ value: 'results' });
            expect(store.error).toBe(null);
          });
      });
    });

    describe('on external updates', () => {
      it('updates the store and searches', () => {
        const _dispatchAlgoliaResponse = jest.fn(function(state) {
          this.emit('result', { value: 'results' }, state);
        });

        jsHepler.mockImplementationOnce((...args) => {
          const instance = jsHepler(...args);

          instance._dispatchAlgoliaResponse = _dispatchAlgoliaResponse;

          return instance;
        });

        const ism = createInstantSearchManager({
          indexName: 'index',
          initialState: {},
          searchParameters: {},
          algoliaClient: client,
        });

        ism.onExternalStateUpdate({});

        expect(ism.store.getState().results).toBe(null);

        return Promise.resolve()
          .then(() => {
            jest.runAllTimers();

            const store = ism.store.getState();
            expect(_dispatchAlgoliaResponse).toHaveBeenCalledTimes(1);
            expect(store.results).toEqual({ value: 'results' });
            expect(store.error).toBe(null);

            ism.widgetsManager.update();
          })
          .then(() => {
            jest.runAllTimers();

            const store = ism.store.getState();
            expect(_dispatchAlgoliaResponse).toHaveBeenCalledTimes(2);
            expect(store.results).toEqual({ value: 'results' });
            expect(store.error).toBe(null);
          });
      });
    });

    describe('on search for facet values', () => {
      it('updates the store and searches', () => {
        const searchForFacetValues = jest.fn(() =>
          Promise.resolve({
            facetHits: 'results',
          })
        );

        jsHepler.mockImplementationOnce((...args) => {
          const instance = jsHepler(...args);

          instance.searchForFacetValues = searchForFacetValues;

          return instance;
        });

        const ism = createInstantSearchManager({
          indexName: 'index',
          initialState: {},
          searchParameters: {},
          algoliaClient: client,
        });

        ism.onSearchForFacetValues({ facetName: 'facetName', query: 'query' });

        expect(ism.store.getState().results).toBe(null);

        jest.runAllTimers();

        return Promise.resolve().then(() => {
          const store = ism.store.getState();

          expect(searchForFacetValues).toHaveBeenCalledWith(
            'facetName',
            'query',
            undefined
          );

          expect(store.searchingForFacetValues).toBe(false);

          expect(store.resultsFacetValues).toEqual({
            facetName: 'results',
            query: 'query',
          });
        });
      });

      it('updates the store and searches with maxFacetHits', () => {
        const searchForFacetValues = jest.fn(() =>
          Promise.resolve({
            facetHits: 'results',
          })
        );

        jsHepler.mockImplementationOnce((...args) => {
          const instance = jsHepler(...args);

          instance.searchForFacetValues = searchForFacetValues;

          return instance;
        });

        const ism = createInstantSearchManager({
          indexName: 'index',
          initialState: {},
          searchParameters: {},
          algoliaClient: client,
        });

        ism.onSearchForFacetValues({
          facetName: 'facetName',
          query: 'query',
          maxFacetHits: 25,
        });

        expect(ism.store.getState().results).toBe(null);

        jest.runAllTimers();

        return Promise.resolve().then(() => {
          const store = ism.store.getState();

          expect(searchForFacetValues).toHaveBeenCalledWith(
            'facetName',
            'query',
            25
          );

          expect(store.resultsFacetValues).toEqual({
            facetName: 'results',
            query: 'query',
          });

          expect(store.searchingForFacetValues).toBe(false);
        });
      });
    });
  });
});
