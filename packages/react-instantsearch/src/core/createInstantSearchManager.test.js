/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import createInstantSearchManager from './createInstantSearchManager';

import algoliaClient from 'algoliasearch';

jest.useFakeTimers();

const client = algoliaClient('latency', '249078a3d4337a8231f1665ec5a44966');
const response = {
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
};
client.search = jest.fn((queries, cb) => {
  if (cb) {
    setTimeout(() => {
      cb(null, response);
    }, 1);
    return undefined;
  }

  return new Promise(resolve => {
    resolve(response);
  });
});

describe('createInstantSearchManager', () => {
  it('initializes the manager with an empty state', () => {
    const ism = createInstantSearchManager({
      indexName: 'index',
      initialState: {},
      searchParameters: {},
      algoliaClient: client,
    });

    const store = ism.store.getState();
    expect(store).toEqual({
      error: null,
      metadata: [],
      results: null,
      searching: false,
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

  describe('Widget manager', () => {
    it('triggers the search when a widget is added', () => {
      const ism = createInstantSearchManager({
        indexName: 'index',
        initialState: {},
        searchParameters: {},
        algoliaClient: client,
      });

      ism.widgetsManager.registerWidget({
        getMetadata: () => {},
        getSearchParameters: () => {},
        transitionState: () => {},
      });

      const storeT0 = ism.store.getState();
      expect(storeT0.searching).toBe(false);

      setImmediate(() => {
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
        algoliaClient: client,
      });

      const nextSearchState = {};

      ism.widgetsManager.registerWidget({
        transitionState: (nxt, current) => {
          expect(nxt).toEqual(nextSearchState);
          return {...current, a: 1};
        },
      });

      ism.widgetsManager.registerWidget({
        transitionState: (nxt, current) => {
          expect(nxt).toEqual(nextSearchState);
          return {...current, b: 2};
        },
      });

      const state = ism.transitionState();
      expect(state).toEqual({a: 1, b: 2});
    });
  });

  describe('getWidgetsIds', () => {
    it('returns the list of ids of all registered widgets', () => {
      const ism = createInstantSearchManager({
        indexName: 'index',
        initialState: {},
        searchParameters: {},
        algoliaClient: client,
      });

      const widgetIDsT0 = ism.getWidgetsIds().sort();
      expect(widgetIDsT0).toEqual([]);

      ism.widgetsManager.registerWidget({getMetadata: () => ({id: 'a'})});
      ism.widgetsManager.registerWidget({getMetadata: () => ({id: 'b'})});
      ism.widgetsManager.registerWidget({getMetadata: () => ({id: 'c'})});

      ism.widgetsManager.registerWidget({getMetadata: () => ({id: 'd'})});

      return Promise.resolve().then(() => {
        const widgetIDsT1 = ism.getWidgetsIds().sort();
        expect(widgetIDsT1).toEqual(['a', 'b', 'c', 'd']);
      });
    });
  });
});
