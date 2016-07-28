/* eslint-env jest, jasmine */

import MockDate from 'mockdate';

import createStateManager from './createStateManager';
jest.unmock('./createStateManager');
import {SearchParameters} from 'algoliasearch-helper';
jest.unmock('algoliasearch-helper');

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

    stateManager.setState(new SearchParameters({query: 'goodbye'}));
    expect(stateManager.getState().query).toBe('goodbye');
  });

  it('calls its onChange callback on setState', () => {
    const onChange = jest.fn();
    const stateManager = createStateManager(
      createMockHistory(location),
      onChange
    );

    expect(onChange.mock.calls.length).toBe(0);
    stateManager.setState(new SearchParameters({query: 'goodbye'}));
    expect(onChange.mock.calls.length).toBe(1);
  });

  it('pushes a new history entry on setState', () => {
    const history = createMockHistory(location, {
      createHref: a => a,
    });
    const stateManager = createStateManager(
      history,
      () => null,
      {
        trackedParameters: ['query'],
      }
    );

    expect(history.push.mock.calls.length).toBe(0);
    stateManager.setState(new SearchParameters({query: 'goodbye'}));
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
        {
          treshold,
          trackedParameters: ['query'],
        }
      );

      MockDate.set(0);
      expect(history.push.mock.calls.length).toBe(0);
      stateManager.setState(new SearchParameters({query: 'goodbye'}));
      expect(history.push.mock.calls.length).toBe(1);
      expect(history.push.mock.calls[0][0].search).toBe('?q=goodbye');
      stateManager.setState(new SearchParameters({query: 'au revoir'}));
      expect(history.push.mock.calls.length).toBe(1);
      expect(history.replace.mock.calls.length).toBe(1);
      expect(history.replace.mock.calls[0][0].search).toBe('?q=au%20revoir');
      MockDate.set(treshold + 1);
      stateManager.setState(new SearchParameters({query: 'goodbye'}));
      expect(history.replace.mock.calls.length).toBe(1);
      expect(history.push.mock.calls.length).toBe(2);
      expect(history.push.mock.calls[1][0].search).toBe('?q=goodbye');
      stateManager.setState(new SearchParameters({query: 'au revoir'}));
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
      {
        createURL,
        trackedParameters: ['query'],
      }
    );

    const state = new SearchParameters({query: 'goodbye'});
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

  it('only tracks the provided trackedParameters', () => {
    const history = createMockHistory(location, {
      createHref: a => a,
    });
    let stateManager;

    const state = new SearchParameters({
      query: 'goodbye',
      page: 3,
      hitsPerPage: 100,
    });

    stateManager = createStateManager(
      history,
      () => null,
      {
        trackedParameters: ['query'],
      }
    );
    stateManager.setState(state);
    expect(history.push.mock.calls.length).toBe(1);
    expect(history.push.mock.calls[0][0]).toEqual({search: '?q=goodbye'});

    stateManager = createStateManager(
      history,
      () => null,
      {
        trackedParameters: ['hitsPerPage'],
      }
    );
    stateManager.setState(state);
    expect(history.push.mock.calls.length).toBe(2);
    expect(history.push.mock.calls[1][0]).toEqual({search: '?hPP=100'});

    stateManager = createStateManager(
      history,
      () => null,
      {
        trackedParameters: ['query', 'page'],
      }
    );
    stateManager.setState(state);
    expect(history.push.mock.calls.length).toBe(3);
    expect(history.push.mock.calls[2][0]).toEqual({search: '?q=goodbye&p=3'});
  });

  it('doesn\'t track empty queries', () => {
    const history = createMockHistory(location, {
      createHref: a => a,
    });

    const stateManager = createStateManager(
      history,
      () => null,
      {
        trackedParameters: ['query'],
      }
    );
    stateManager.setState(new SearchParameters({query: ''}));
    expect(history.push.mock.calls.length).toBe(1);
    expect(history.push.mock.calls[0][0]).toEqual({search: '?'});
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
