/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import createHistoryStateManager from './createHistoryStateManager';

import MockDate from 'mockdate';

const createMockHistory = (initialLocation, isV3) => {
  const listeners = [];
  let currentLocation = initialLocation;
  const dispatch = () =>
    listeners.forEach(listener => listener(currentLocation));
  return {
    listen: jest.fn(listener => {
      listeners.push(listener);
      if (!isV3) {
        listener(initialLocation);
      }
      return () => {
        listeners.splice(listeners.indexOf(listener), 1);
      };
    }),
    push: jest.fn(location => {
      currentLocation = location;
      dispatch();
    }),
    replace: jest.fn(location => {
      currentLocation = location;
      dispatch();
    }),
    // Would normally take in a location object and return a string, but we
    // want to inspect the object.
    createHref: a => a,
    getCurrentLocation: isV3 ? () => currentLocation : undefined,
  };
};

describe('createHistoryStateManager', () => {
  describe('getStateFromCurrentLocation', () => {
    it('retrieves the state from the current location', () => {
      const initialLocation = {
        search: '?hello=yes',
      };
      const history = createMockHistory(initialLocation);
      const hsm = createHistoryStateManager({
        history,
        threshold: 0,
        onInternalStateUpdate: () => null,
        getKnownKeys: () => ['hello'],
      });
      expect(hsm.getStateFromCurrentLocation()).toEqual({hello: 'yes'});
    });

    it('also supports history V3', () => {
      const initialLocation = {
        search: '?hello=yes',
      };
      const history = createMockHistory(initialLocation, true);
      const hsm = createHistoryStateManager({
        history,
        threshold: 0,
        onInternalStateUpdate: () => null,
        getKnownKeys: () => ['hello'],
      });
      expect(hsm.getStateFromCurrentLocation()).toEqual({hello: 'yes'});
    });

    it('also supports the query enhancer', () => {
      const initialLocation = {
        query: {hello: 'yes'},
      };
      const history = createMockHistory(initialLocation);
      const hsm = createHistoryStateManager({
        history,
        threshold: 0,
        onInternalStateUpdate: () => null,
        getKnownKeys: () => ['hello'],
      });
      expect(hsm.getStateFromCurrentLocation()).toEqual({hello: 'yes'});
    });
  });

  describe('onExternalStateUpdate', () => {
    it('causes a new location to be pushed', () => {
      const initialLocation = {
        query: {hello: 'yes', oy: 'sup'},
      };
      const history = createMockHistory(initialLocation);
      const hsm = createHistoryStateManager({
        history,
        threshold: 0,
        onInternalStateUpdate: () => null,
        getKnownKeys: () => ['hello', 'oy'],
      });
      hsm.onExternalStateUpdate({hello: 'no'});
      expect(history.push.mock.calls[0][0]).toEqual({
        query: {hello: 'no'},
      });
    });

    it('replaces the location when the threshold isn\'t reached', () => {
      const initialLocation = {
        query: {hello: 'yes'},
      };
      const history = createMockHistory(initialLocation);
      const onInternalStateUpdate = jest.fn();
      const hsm = createHistoryStateManager({
        history,
        threshold: 1,
        onInternalStateUpdate,
        getKnownKeys: () => ['hello'],
      });
      MockDate.set(0);
      hsm.onExternalStateUpdate({hello: 'no'});
      expect(history.push.mock.calls.length).toBe(1);
      expect(history.replace.mock.calls.length).toBe(0);
      hsm.onExternalStateUpdate({hello: 'yes'});
      expect(history.push.mock.calls.length).toBe(1);
      expect(history.replace.mock.calls.length).toBe(1);
      MockDate.set(1);
      hsm.onExternalStateUpdate({hello: 'no'});
      expect(history.push.mock.calls.length).toBe(1);
      expect(history.replace.mock.calls.length).toBe(2);
      MockDate.set(3);
      hsm.onExternalStateUpdate({hello: 'yes'});
      expect(history.push.mock.calls.length).toBe(2);
      expect(history.replace.mock.calls.length).toBe(2);
      MockDate.reset();
    });

    it('doesn\'t trigger an internal state update', () => {
      const initialLocation = {
        query: {hello: 'yes'},
      };
      const history = createMockHistory(initialLocation);
      const onInternalStateUpdate = jest.fn();
      const hsm = createHistoryStateManager({
        history,
        threshold: 0,
        onInternalStateUpdate,
        getKnownKeys: () => ['hello'],
      });
      hsm.onExternalStateUpdate({hello: 'no'});
      expect(onInternalStateUpdate.mock.calls.length).toBe(0);
    });
  });

  describe('createHrefForState', () => {
    it('applies a new state to the current location', () => {
      const initialLocation = {
        query: {hello: 'yes', not: 'cool'},
      };
      const history = createMockHistory(initialLocation);
      const hsm = createHistoryStateManager({
        history,
        threshold: 0,
        onInternalStateUpdate: () => null,
        getKnownKeys: () => ['hello'],
      });
      expect(hsm.createHrefForState({hello: 'no'})).toEqual({
        query: {hello: 'no', not: 'cool'},
      });
    });

    it('sorts keys by alphabetical value', () => {
      const initialLocation = {
        search: '?c=1&b=2&a=3',
      };
      const history = createMockHistory(initialLocation);
      const hsm = createHistoryStateManager({
        history,
        threshold: 0,
        onInternalStateUpdate: () => null,
        getKnownKeys: () => ['a', 'c'],
      });
      expect(hsm.createHrefForState({a: '1', c: '3'})).toEqual({
        search: '?a=1&b=2&c=3',
      });
    });
  });

  describe('unlisten', () => {
    it('clears the corresponding listener', () => {
      const initialLocation = {
        query: {hello: 'yes', not: 'cool'},
      };
      const history = createMockHistory(initialLocation);
      const unlisten = jest.fn();
      history.listen.mockImplementation(() => unlisten);
      const hsm = createHistoryStateManager({
        history,
        threshold: 0,
        onInternalStateUpdate: () => null,
        getKnownKeys: () => ['hello'],
      });
      hsm.unlisten();
      expect(unlisten.mock.calls.length).toBe(1);
    });
  });

  describe('onInternalStateUpdate', () => {
    it('gets called on location change', () => {
      const initialLocation = {
        query: {hello: 'yes'},
      };
      const history = createMockHistory(initialLocation);
      const onInternalStateUpdate = jest.fn();
      createHistoryStateManager({
        history,
        threshold: 0,
        onInternalStateUpdate,
        getKnownKeys: () => ['hello'],
      });
      history.push({query: {hello: 'no', oy: 'sup'}});
      expect(onInternalStateUpdate.mock.calls.length).toBe(1);
      expect(onInternalStateUpdate.mock.calls[0][0]).toEqual({hello: 'no'});
    });

    it('doesn\'t react to state updates that trigger a location change', () => {
      const initialLocation = {
        query: {hello: 'yes'},
      };
      const history = createMockHistory(initialLocation);
      const onInternalStateUpdate = jest.fn();
      const hsm = createHistoryStateManager({
        history,
        threshold: -1,
        onInternalStateUpdate,
        getKnownKeys: () => ['hello'],
      });
      hsm.onExternalStateUpdate({hello: 'no'});
      expect(onInternalStateUpdate.mock.calls.length).toBe(0);
      history.push({query: {hello: 'yes'}});
      expect(onInternalStateUpdate.mock.calls.length).toBe(1);
    });
  });
});
