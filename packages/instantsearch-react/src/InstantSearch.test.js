/* eslint-env jest, jasmine */

import React from 'react';
import {mount, shallow} from 'enzyme';

import algoliasearch from 'algoliasearch';
jest.unmock('debug');
import algoliasearchHelper from 'algoliasearch-helper';

import createStateManager from './createStateManager';
import createConfigManager from './createConfigManager';

import InstantSearch from './InstantSearch';
jest.unmock('./InstantSearch');

jest.mock('algoliasearch', () => jest.fn(() => ({
  search: jest.fn(),
})));

jest.mock('algoliasearch-helper', () => {
  const mock = jest.fn(() => {
    let state = {};
    const helper = {
      setState: jest.fn(s => {
        state = s;
      }),
      getState: jest.fn(() => state),
      search: jest.fn(),
    };
    mock.__helpers.push(helper);
    return helper;
  });
  mock.SearchParameters = function MockSearchParameters(s) {
    Object.assign(this, s);
  };
  mock.__helpers = [];
  return mock;
});

jest.mock('./createStateManager', () => {
  let state = {};
  const mock = jest.fn(() => ({
    __isStateManager: true,
    getState: jest.fn(() => state),
    unlisten: jest.fn(),
  }));
  mock.__setState = s => {
    state = s;
  };
  return mock;
});

jest.mock('./createConfigManager', () => {
  let getState = s => s;
  const mock = jest.fn(() => ({
    __isConfigManager: true,
    getState: jest.fn(s => getState(s)),
  }));
  mock.__setGetState = s => {
    getState = s;
  };
  return mock;
});

jest.mock('history', () => ({
  createHistory: jest.fn(() => ({
    __isHistory: true,
  })),
  createMemoryHistory: jest.fn(() => ({
    __isMemoryHistory: true,
  })),
}));

describe('InstantSearch', () => {
  afterEach(() => {
    algoliasearch.mockClear();
    algoliasearchHelper.mockClear();
    algoliasearchHelper.__helpers = [];
    createStateManager.mockClear();
    createStateManager.__setState({});
    createConfigManager.mockClear();
    createConfigManager.__setGetState(s => s);
  });

  it('correctly instantiates the API client and helper', () => {
    mount(
      <InstantSearch appId="foo" apiKey="bar" indexName="foobar">
        <div />
      </InstantSearch>
    );
    expect(algoliasearch.mock.calls[0]).toEqual(['foo', 'bar']);
    expect(algoliasearchHelper.mock.calls[0][1]).toBe('foobar');
  });

  it('exposes a configManager and a stateManager in context', () => {
    const wrapper = mount(
      <InstantSearch appId="foo" apiKey="bar" indexName="foobar">
        <div />
      </InstantSearch>
    );

    const {
      algoliaConfigManager,
      algoliaStateManager,
    } = wrapper.instance().getChildContext();
    expect(algoliaConfigManager.__isConfigManager).toBe(true);
    expect(algoliaStateManager.__isStateManager).toBe(true);
  });

  it('accepts a custom history', () => {
    const history = {};
    mount(
      <InstantSearch
        appId="foo"
        apiKey="bar"
        indexName="foobar"
        history={history}
      >
        <div />
      </InstantSearch>
    );

    // Just test that it correctly passes it through to its state manager
    expect(createStateManager.mock.calls[0][0]).toBe(history);
  });

  it('creates a memory history when no history and urlSync=false', () => {
    mount(
      <InstantSearch
        appId="foo"
        apiKey="bar"
        indexName="foobar"
        urlSync={false}
      >
        <div />
      </InstantSearch>
    );

    expect(createStateManager.mock.calls[0][0].__isMemoryHistory).toBe(true);
  });

  it('creates a browser history when no history and urlSync=true', () => {
    mount(
      <InstantSearch
        appId="foo"
        apiKey="bar"
        indexName="foobar"
        urlSync={true}
      >
        <div />
      </InstantSearch>
    );

    expect(createStateManager.mock.calls[0][0].__isHistory).toBe(true);
  });

  it('passes its treshold and createURL props to its stateManager', () => {
    const createURL = jest.fn();
    const treshold = 666;
    mount(
      <InstantSearch
        appId="foo"
        apiKey="bar"
        indexName="foobar"
        createURL={createURL}
        treshold={treshold}
      >
        <div />
      </InstantSearch>
    );

    expect(createStateManager.mock.calls[0][2].createURL).toBe(createURL);
    expect(createStateManager.mock.calls[0][2].treshold).toBe(treshold);
  });

  it('calls search on didMount and not on willMount', () => {
    let helper;

    shallow(
      <InstantSearch
        appId="foo"
        apiKey="bar"
        indexName="foobar"
      >
        <div />
      </InstantSearch>
    );

    helper = algoliasearchHelper.__helpers[0];
    expect(helper.search.mock.calls.length).toBe(0);

    mount(
      <InstantSearch
        appId="foo"
        apiKey="bar"
        indexName="foobar"
      >
        <div />
      </InstantSearch>
    );

    helper = algoliasearchHelper.__helpers[1];
    expect(helper.search.mock.calls.length).toBe(1);
  });

  function getHelper(configureState = null) {
    mount(
      <InstantSearch
        appId="foo"
        apiKey="bar"
        indexName="foobar"
        configureState={configureState}
      >
        <div />
      </InstantSearch>
    );

    const helper = algoliasearchHelper.__helpers[0];
    algoliasearchHelper.__helpers = [];
    return helper;
  }

  it('correctly creates initial state', () => {
    let helper;

    helper = getHelper();
    expect(helper.setState.mock.calls[0][0]).toEqual({index: 'foobar'});

    helper = getHelper(s => ({...s, page: 1}));
    expect(helper.setState.mock.calls[0][0]).toEqual({
      index: 'foobar',
      page: 1,
    });

    createStateManager.__setState({index: '', page: 2, hitsPerPage: 4});
    helper = getHelper(s => ({...s, page: s.page + 1, hitsPerPage: 5}));
    expect(helper.setState.mock.calls[0][0]).toEqual({
      index: 'foobar',
      hitsPerPage: 5,
      page: 3,
    });

    createConfigManager.__setGetState(s => ({...s, hitsPerPage: 6}));
    helper = getHelper(s => ({...s, page: s.page + 1, hitsPerPage: 5}));
    expect(helper.setState.mock.calls[0][0]).toEqual({
      index: 'foobar',
      hitsPerPage: 6,
      page: 3,
    });
  });

  it('correctly updates its helper state upon config or state change', () => {
    const helper = getHelper();
    const onConfigChange = createConfigManager.mock.calls[0][0];
    const onStateChange = createStateManager.mock.calls[0][1];

    createConfigManager.__setGetState(s => ({...s, page: 1}));
    onConfigChange();
    expect(helper.setState.mock.calls[2][0]).toEqual({
      index: 'foobar',
      page: 1,
    });
    expect(helper.search.mock.calls.length).toBe(2);

    onConfigChange();
    expect(helper.search.mock.calls.length).toBe(2);

    createStateManager.__setState({hitsPerPage: 5});
    onStateChange();
    expect(helper.setState.mock.calls[3][0]).toEqual({
      index: 'foobar',
      page: 1,
      hitsPerPage: 5,
    });
    expect(helper.search.mock.calls.length).toBe(3);

    onStateChange();
    expect(helper.search.mock.calls.length).toBe(3);
  });

  it('cleans up after itself', () => {
    const wrapper = mount(
      <InstantSearch
        appId="foo"
        apiKey="bar"
        indexName="foobar"
      >
        <div />
      </InstantSearch>
    );

    const {algoliaStateManager} = wrapper.instance().getChildContext();

    expect(algoliaStateManager.unlisten.mock.calls.length).toBe(0);
    wrapper.unmount();
    expect(algoliaStateManager.unlisten.mock.calls.length).toBe(1);
  });
});
