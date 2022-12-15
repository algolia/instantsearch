import createStore from '../createStore';

describe('createStore', () => {
  describe('getState', () => {
    it('retrieves the current state of the store', () => {
      const initialState = {};
      const store = createStore(initialState);
      expect(store.getState()).toBe(initialState);
    });
  });

  describe('setState', () => {
    it('sets a new state', () => {
      const initialState = {};
      const store = createStore(initialState);
      const newState = {};
      store.setState(newState);
      expect(store.getState()).toBe(newState);
    });
  });

  describe('subscribe', () => {
    it('subscribes to new states', () => {
      const initialState = {};
      const store = createStore(initialState);
      const listener = jest.fn();
      store.subscribe(listener);
      const newState = {};
      expect(listener.mock.calls).toHaveLength(0);
      store.setState(newState);
      expect(listener.mock.calls).toHaveLength(1);
    });

    it('returns a method to unsubscribe', () => {
      const initialState = {};
      const store = createStore(initialState);
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);
      const newState = {};
      expect(listener.mock.calls).toHaveLength(0);
      store.setState(newState);
      expect(listener.mock.calls).toHaveLength(1);
      unsubscribe();
      const newerState = {};
      store.setState(newerState);
      expect(listener.mock.calls).toHaveLength(1);
    });
  });
});
