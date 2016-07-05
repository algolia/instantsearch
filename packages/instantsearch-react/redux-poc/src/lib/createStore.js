export default function createStore(reducer, initialState) {
  let state = reducer(initialState, { type: '@@INIT' });
  const listeners = [];

  return {
    getState() {
      return state;
    },
    dispatch(action) {
      // Poor man's redux-logger
      // https://github.com/evgenyrodionov/redux-logger
      console.log('prev', { action, state });
      state = reducer(state, action);
      console.log('next', { action, state });
      listeners.forEach(listener => listener());
    },
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        listeners.splice(listeners.indexOf(listener), 1);
      };
    },
  };
}
