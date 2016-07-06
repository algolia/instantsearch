export default function createStore(helper) {
  let state = {
    searching: false,
    searchParameters: helper.getState(),
    searchResults: null,
    searchError: null,
  };
  const listeners = [];
  const dispatch = () => {
    listeners.forEach(listener => listener());
  };

  helper.on('change', searchParameters => {
    state = {
      ...state,
      searchParameters,
    };
    dispatch();
  });

  helper.on('search', () => {
    state = {
      ...state,
      searching: true,
    };
    dispatch();
  });

  helper.on('result', searchResults => {
    state = {
      ...state,
      searching: false,
      searchResults,
    };
    dispatch();
  });

  helper.on('error', searchError => {
    state = {
      ...state,
      searching: false,
      searchError,
    };
    dispatch();
  });

  return {
    getHelper: () => helper,
    getState: () => {
      return state;
    },
    subscribe: listener => {
      listeners.push(listener);
      return () => {
        listeners.splice(listeners.indexOf(listener));
      };
    },
  };
}
