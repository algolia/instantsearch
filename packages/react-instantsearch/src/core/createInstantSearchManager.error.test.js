/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import createInstantSearchManager from './createInstantSearchManager';

import algoliaClient from 'algoliasearch';

jest.useFakeTimers();

jest.mock('algoliasearch-helper/src/algoliasearch.helper.js', () => {
  let count = 0;
  console.log('setup');
  const Helper = require.requireActual('algoliasearch-helper/src/algoliasearch.helper.js');
  Helper.prototype._handleResponse = function(state) {
    this.emit('error', {count: count++}, state);
  };
  return Helper;
});

const client = algoliaClient('latency', '249078a3d4337a8231f1665ec5a44966');
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
  describe('with error from algolia', () => {
    describe('on widget lifecycle', () => {
      it('updates the store and searches', () => {
        const ism = createInstantSearchManager({
          indexName: 'index',
          initialState: {},
          searchParameters: {},
          algoliaClient: client,
        });

        ism.widgetsManager.registerWidget({
          getSearchParameters: params => params.setQuery('search'),
        });

        expect(ism.store.getState().error).toBe(null);

        jest.runAllTimers();

        const store = ism.store.getState();
        expect(store.error).toEqual({count: 0});
        expect(store.results).toBe(null);

        ism.widgetsManager.update();

        jest.runAllTimers();

        const store1 = ism.store.getState();
        expect(store1.error).toEqual({count: 1});
        expect(store1.results).toBe(null);
      });
    });
    describe('on external updates', () => {
      it('updates the store and searches', () => {
        const ism = createInstantSearchManager({
          indexName: 'index',
          initialState: {},
          searchParameters: {},
          algoliaClient: client,
        });

        ism.onExternalStateUpdate({});

        expect(ism.store.getState().error).toBe(null);

        jest.runAllTimers();

        const store = ism.store.getState();
        expect(store.error).toEqual({count: 2});
        expect(store.results).toBe(null);
      });
    });
  });
});
