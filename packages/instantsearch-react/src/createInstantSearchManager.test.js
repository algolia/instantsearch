/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import createInstantSearchManager from './createInstantSearchManager';
jest.unmock('./createInstantSearchManager');

import algoliasearch from 'algoliasearch';
jest.mock('algoliasearch', () => jest.fn());
import algoliasearchHelper from 'algoliasearch-helper';
jest.mock('algoliasearch-helper', () => {
  const output = jest.fn();
  const {SearchParameters} = require.requireActual('algoliasearch-helper', {
    // `requireActual` is bugged and returns a mocked version of the module
    // Passing `isInternalModule` disables this behaviour.
    // Note that this option isn't documented.
    isInternalModule: true,
  });
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

  function init() {
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

    it('is exposed through context', () => {
      const store = {};
      createStore.mockImplementationOnce(() => store);
      init();
      expect(ism.context.store).toBe(store);
    });
  });

  describe('onInternalStateUpdate', () => {
    it('transitions state and calls opts.onInternalStateUpdate', () => {
      init();
      ism.context.store.setState({
        ...ism.context.store.getState(),
        metadata: [
          {id: 'q'},
          {id: 'p', clearOnChange: true},
        ],
      });
      ism.context.onInternalStateUpdate({q: 'no', p: 3});
      expect(onInternalStateUpdate.mock.calls.length).toBe(1);
      expect(onInternalStateUpdate.mock.calls[0][0]).toEqual({q: 'no', p: 3});
      ism.context.store.setState({
        ...ism.context.store.getState(),
        widgets: {q: 'no', p: 3},
      });
      ism.context.onInternalStateUpdate({q: 'no', p: 4});
      expect(onInternalStateUpdate.mock.calls.length).toBe(2);
      expect(onInternalStateUpdate.mock.calls[1][0]).toEqual({q: 'no', p: 4});
      ism.context.store.setState({
        ...ism.context.store.getState(),
        widgets: {q: 'no', p: 4},
      });
      ism.context.onInternalStateUpdate({q: 'yes', p: 4});
      expect(onInternalStateUpdate.mock.calls.length).toBe(3);
      expect(onInternalStateUpdate.mock.calls[2][0]).toEqual({q: 'yes'});
    });
  });

  describe('createHrefForState', () => {
    it('transitions state and calls opts.createHrefForState', () => {
      init();
      let href;
      ism.context.store.setState({
        ...ism.context.store.getState(),
        metadata: [
          {id: 'q'},
          {id: 'p', clearOnChange: true},
        ],
      });
      href = ism.context.createHrefForState({q: 'no', p: 3});
      expect(createHrefForState.mock.calls.length).toBe(1);
      expect(createHrefForState.mock.calls[0][0]).toEqual({q: 'no', p: 3});
      expect(href).toEqual({q: 'no', p: 3});
      ism.context.store.setState({
        ...ism.context.store.getState(),
        widgets: {q: 'no', p: 3},
      });
      href = ism.context.createHrefForState({q: 'no', p: 4});
      expect(createHrefForState.mock.calls.length).toBe(2);
      expect(createHrefForState.mock.calls[1][0]).toEqual({q: 'no', p: 4});
      expect(href).toEqual({q: 'no', p: 4});
      ism.context.store.setState({
        ...ism.context.store.getState(),
        widgets: {q: 'no', p: 4},
      });
      href = ism.context.createHrefForState({q: 'yes', p: 4});
      expect(createHrefForState.mock.calls.length).toBe(3);
      expect(createHrefForState.mock.calls[2][0]).toEqual({q: 'yes'});
      expect(href).toEqual({q: 'yes'});
    });
  });

  describe('getWidgetsIds', () => {
    it('returns the list of ids of all registered widgets', () => {
      init();
      ism.context.store.setState({
        ...ism.context.store.getState(),
        metadata: [
          {id: 'q'},
          {id: 'p'},
        ],
      });
      expect(ism.getWidgetsIds()).toEqual(['q', 'p']);
    });
  });

  function testSearch(promise) {
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
    init();
    return helper.searchOnce;
  }

  describe('widgetsManager', () => {
    it('is exposed through context', () => {
      const widgetsManager = {};
      createWidgetsManager.mockImplementationOnce(() => widgetsManager);
      init();
      expect(ism.context.widgetsManager).toBe(widgetsManager);
    });

    it('updates the store and searches on update', () => {
      const searchOnce = testSearch(new Promise(() => null));
      const onUpdate = createWidgetsManager.mock.calls[0][0];
      onUpdate();
      expect(ism.context.store.setState.mock.calls.length).toBe(1);
      expect(ism.context.store.setState.mock.calls[0][0]).toEqual({
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
  });

  describe('onExternalStateUpdate', () => {
    it('updates the store and searches', () => {
      const results = {};
      const searchOnce = testSearch(Promise.resolve({content: results}));
      ism.onExternalStateUpdate({hello: 'no'});
      expect(ism.context.store.setState.mock.calls.length).toBe(1);
      expect(ism.context.store.setState.mock.calls[0][0]).toEqual({
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
        expect(ism.context.store.setState.mock.calls.length).toBe(2);
        expect(ism.context.store.setState.mock.calls[1][0]).toEqual({
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
        expect(ism.context.store.setState.mock.calls.length).toBe(2);
        expect(ism.context.store.setState.mock.calls[1][0]).toEqual({
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
