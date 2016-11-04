/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import createInstantSearchManager from './createInstantSearchManager';

import algoliasearch from 'algoliasearch';
jest.mock('algoliasearch', () => jest.fn());
import algoliasearchHelper from 'algoliasearch-helper';
jest.mock('algoliasearch-helper', () => {
  const output = jest.fn();
  const SearchParameters = require.requireActual('algoliasearch-helper/src/SearchParameters');
  output.SearchParameters = SearchParameters;
  return output;
});

import createStore from './createStore';
jest.mock('./createStore', () => jest.fn(initialState => {
  let state = initialState;
  return {
    setState: jest.fn(nextState => {
      state = nextState;
    }),
    getState: () => state,
  };
}));
import createWidgetsManager from './createWidgetsManager';
jest.mock('./createWidgetsManager', () => jest.fn());

describe('createInstantSearchManager', () => {
  let createHrefForState;
  let onInternalStateUpdate;
  let initialState;
  let ism;

  function init(otherISMParameters = {}) {
    createHrefForState = jest.fn(a => a);
    onInternalStateUpdate = jest.fn();
    initialState = {
      hello: 'yes',
    };
    ism = createInstantSearchManager({
      appId: 'appId',
      apiKey: 'apiKey',
      indexName: 'indexName',

      initialState,
      createHrefForState,
      onInternalStateUpdate,
      ...otherISMParameters,
    });
  }

  beforeEach(() => {
    algoliasearch.mockClear();
    algoliasearchHelper.mockClear();
    createStore.mockClear();
    createWidgetsManager.mockClear();
  });

  it('initializes the algoliasearch client with correct options', () => {
    init();
    expect(algoliasearch.mock.calls[0]).toEqual(['appId', 'apiKey']);
  });

  it('overrides the default algoliasearch client with algoliaClient', () => {
    const algoliaClient = {};
    init({algoliaClient});
    expect(algoliasearch.mock.calls.length).toEqual(0);
    expect(algoliasearchHelper.mock.calls[0][0]).toBe(algoliaClient);
  });

  it('initializes the algoliasearch helper with correct options', () => {
    const client = {};
    algoliasearch.mockImplementationOnce(() => client);
    init();
    expect(algoliasearchHelper.mock.calls[0][0]).toBe(client);
  });

  describe('store', () => {
    it('is initialized with correct data', () => {
      init();
      const data = createStore.mock.calls[0][0];
      expect(data).toEqual({
        widgets: initialState,
        metadata: [],
        results: null,
        error: null,
        searching: false,
      });
    });

    it('is exposed on the instance', () => {
      const store = {};
      createStore.mockImplementationOnce(() => store);
      init();
      expect(ism.store).toBe(store);
    });
  });

  describe('transitionState', () => {
    it('executes all widgets\'s transitionState hooks', () => {
      createWidgetsManager.mockImplementationOnce(() => ({
        getWidgets: () => [
          {
            transitionState: (state, nextState) => ({...nextState, first: true}),
          },
          {
            transitionState: (state, nextState) => ({...nextState, second: true}),
          },
        ],
      }));
      init();
      ism.store.setState({
        ...ism.store.getState(),
        metadata: [
          {id: 'q'},
          {id: 'p'},
        ],
      });
      const state = ism.transitionState({q: 'no', p: 3});
      expect(state).toEqual({
        q: 'no',
        p: 3,
        first: true,
        second: true,
      });
    });
  });

  describe('getWidgetsIds', () => {
    it('returns the list of ids of all registered widgets', () => {
      init();
      ism.store.setState({
        ...ism.store.getState(),
        metadata: [
          {id: 'q'},
          {id: 'p'},
        ],
      });
      expect(ism.getWidgetsIds()).toEqual(['q', 'p']);
    });
  });

  function testSearch(promise, searchParameters = undefined) {
    const helper = {
      searchOnce: jest.fn(() => promise),
    };
    algoliasearchHelper.mockImplementationOnce(() => helper);
    createWidgetsManager.mockImplementationOnce(() => ({
      getWidgets: () => [
        {
          getMetadata: s => ({id: 'q', hello: s.hello}),
          getSearchParameters: sp => sp.setQuery('hello'),
        },
        {},
        {
          getMetadata: () => ({id: 'p'}),
        },
        {
          getSearchParameters: sp => sp.setPage(20),
        },
      ],
    }));
    init({searchParameters});
    return helper.searchOnce;
  }

  describe('widgetsManager', () => {
    it('is exposed on the instance', () => {
      const widgetsManager = {};
      createWidgetsManager.mockImplementationOnce(() => widgetsManager);
      init();
      expect(ism.widgetsManager).toBe(widgetsManager);
    });

    it('updates the store and searches on update', () => {
      const searchOnce = testSearch(new Promise(() => null));
      const onUpdate = createWidgetsManager.mock.calls[0][0];
      onUpdate();
      expect(ism.store.setState.mock.calls.length).toBe(1);
      expect(ism.store.setState.mock.calls[0][0]).toEqual({
        widgets: initialState,
        metadata: [{id: 'q', hello: 'yes'}, {id: 'p'}],
        results: null,
        error: null,
        searching: true,
      });
      expect(searchOnce.mock.calls.length).toBe(1);
      const params = searchOnce.mock.calls[0][0];
      expect(params.query).toBe('hello');
      expect(params.page).toBe(20);
    });

    it('when searching it adds the searchParameters if any', () => {
      const searchOnce = testSearch(new Promise(() => null), {distinct: 1});
      const onUpdate = createWidgetsManager.mock.calls[0][0];
      onUpdate();
      const params = searchOnce.mock.calls[0][0];
      expect(params.query).toBe('hello');
      expect(params.page).toBe(20);
      expect(params.distinct).toBe(1);
    });
  });

  describe('onExternalStateUpdate', () => {
    it('updates the store and searches', () => {
      const results = {};
      const searchOnce = testSearch(Promise.resolve({content: results}));
      ism.onExternalStateUpdate({hello: 'no'});
      expect(ism.store.setState.mock.calls.length).toBe(1);
      expect(ism.store.setState.mock.calls[0][0]).toEqual({
        widgets: {hello: 'no'},
        metadata: [{id: 'q', hello: 'no'}, {id: 'p'}],
        results: null,
        error: null,
        searching: true,
      });
      expect(searchOnce.mock.calls.length).toBe(1);
      const params = searchOnce.mock.calls[0][0];
      expect(params.query).toBe('hello');
      expect(params.page).toBe(20);

      // Since promises are always resolved asynchronously, we need to create
      // a new promise in order to hook into the next promise tick.
      return Promise.resolve().then(() => {
        expect(ism.store.setState.mock.calls.length).toBe(2);
        expect(ism.store.setState.mock.calls[1][0]).toEqual({
          widgets: {hello: 'no'},
          metadata: [{id: 'q', hello: 'no'}, {id: 'p'}],
          results,
          error: null,
          searching: false,
        });
      });
    });

    it('errors are correctly stored', () => {
      const error = new Error();
      testSearch(Promise.reject(error));
      ism.onExternalStateUpdate({hello: 'no'});

      return Promise.resolve().then(() => {
        expect(ism.store.setState.mock.calls.length).toBe(2);
        expect(ism.store.setState.mock.calls[1][0]).toEqual({
          widgets: {hello: 'no'},
          metadata: [{id: 'q', hello: 'no'}, {id: 'p'}],
          results: null,
          error,
          searching: false,
        });
      });
    });
  });
});
