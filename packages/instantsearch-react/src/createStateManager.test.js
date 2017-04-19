/* eslint-env jest, jasmine */

import MockDate from 'mockdate';

import createStateManager from './createStateManager';
jest.unmock('./createStateManager');
jest.unmock('algoliasearch-helper');
jest.unmock('algoliasearch-helper/src/url');

const location = {
  search: '?q=hellooo',
};

const createMockHistory = (initialLocation, overrides) => ({
  listen: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  getCurrentLocation: jest.fn(() => initialLocation),
  createHref: jest.fn(),
  ...overrides,
});

describe('createStateManager', () => {
  it('retrieves the initial state from the URL', () => {
    const stateManager = createStateManager({
      listen: listener => {
        listener(location);
      },
    });

    expect(stateManager.getState().query).toBe('hellooo');
  });

  it('also works with history v3', () => {
    const stateManager = createStateManager({
      getCurrentLocation: () => location,
      listen: () => null,
    });

    expect(stateManager.getState().query).toBe('hellooo');
  });

  it('updates its state on setState', () => {
    const stateManager = createStateManager(
      createMockHistory(location),
      () => null
    );

    stateManager.setState({query: 'goodbye'});
    expect(stateManager.getState().query).toBe('goodbye');
  });

  it('calls its onChange callback on setState', () => {
    const onChange = jest.fn();
    const stateManager = createStateManager(
      createMockHistory(location),
      onChange
    );

    expect(onChange.mock.calls.length).toBe(0);
    stateManager.setState({query: 'goodbye'});
    expect(onChange.mock.calls.length).toBe(1);
  });

  it('pushes a new history entry on setState', () => {
    const history = createMockHistory(location, {
      createHref: a => a,
    });
    const stateManager = createStateManager(
      history,
      () => null
    );

    expect(history.push.mock.calls.length).toBe(0);
    stateManager.setState({query: 'goodbye'});
    expect(history.push.mock.calls.length).toBe(1);
    expect(history.push.mock.calls[0][0].search).toBe('?q=goodbye');
  });

  it('replaces instead of pushing at intervals shorter than treshold', () => {
    function testTreshold(treshold) {
      const history = createMockHistory(location, {
        createHref: a => a,
      });

      const stateManager = createStateManager(
        history,
        () => null,
        {treshold}
      );

      MockDate.set(0);
      expect(history.push.mock.calls.length).toBe(0);
      stateManager.setState({query: 'goodbye'});
      expect(history.push.mock.calls.length).toBe(1);
      expect(history.push.mock.calls[0][0].search).toBe('?q=goodbye');
      stateManager.setState({query: 'au revoir'});
      expect(history.push.mock.calls.length).toBe(1);
      expect(history.replace.mock.calls.length).toBe(1);
      expect(history.replace.mock.calls[0][0].search).toBe('?q=au%20revoir');
      MockDate.set(treshold + 1);
      stateManager.setState({query: 'goodbye'});
      expect(history.replace.mock.calls.length).toBe(1);
      expect(history.push.mock.calls.length).toBe(2);
      expect(history.push.mock.calls[1][0].search).toBe('?q=goodbye');
      stateManager.setState({query: 'au revoir'});
      expect(history.push.mock.calls.length).toBe(2);
      expect(history.replace.mock.calls.length).toBe(2);
      expect(history.replace.mock.calls[1][0].search).toBe('?q=au%20revoir');
      MockDate.reset();
    }

    testTreshold(0);
    testTreshold(500);
  });

  it('uses the createURL function option when provided', () => {
    const history = createMockHistory(location, {
      createHref: a => a,
    });

    const createURL = jest.fn(a => a);
    const stateManager = createStateManager(
      history,
      () => null,
      {createURL}
    );

    const state = {query: 'goodbye'};
    stateManager.setState(state);
    expect(history.push.mock.calls.length).toBe(1);
    expect(history.push.mock.calls[0][0]).toBe(state);
    expect(createURL.mock.calls[0][0]).toBe(state);

    // And passes a stateToQueryString function
    const stateToQueryString = createURL.mock.calls[0][1];
    expect(typeof createURL.mock.calls[0][1]).toBe('function');
    expect(stateToQueryString(state)).toBe('q=goodbye');
    expect(stateToQueryString(state, {wat: 'wut'})).toBe('q=goodbye&wat=wut');

    expect(stateManager.createURL(state)).toBe(state);
    expect(createURL.mock.calls[1][0]).toBe(state);
    expect(typeof createURL.mock.calls[1][1]).toBe('function');
  });

  it('correctly cleans up after itself when calling unlisten', () => {
    const unlisten = jest.fn();
    const history = createMockHistory(location, {
      listen: () => unlisten,
    });

    const stateManager = createStateManager(
      history,
      () => null
    );

    stateManager.unlisten();
    expect(unlisten.mock.calls.length).toBe(1);
  });
});
