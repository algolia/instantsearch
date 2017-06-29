export default function createStore(initialState) {
  let state = initialState;
  const listeners = [];
  function dispatch() {
    listeners.forEach(listener => setTimeout(listener, 0));
  }
  return {
    getState() {
      return state;
    },
    setState(nextState) {
      state = nextState;
      dispatch();
    },
    subscribe(listener) {
      listeners.push(listener);
      return function unsubcribe() {
        listeners.splice(listeners.indexOf(listener), 1);
      };
    },
  };
}
