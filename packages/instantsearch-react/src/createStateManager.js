import {SearchParameters, url} from 'algoliasearch-helper';

const {
  getQueryStringFromState,
  getStateFromQueryString,
  getUnrecognizedParametersInQueryString,
} = url;

export default function createStateManager(
  history,
  onStateChange,
  options = {}
) {
  // Making location changes ourselves will still trigger the history listener
  // so we need a flag to know when to ignore those events.
  let ignoreThatOne = false;
  let currentState;
  let currentLocation;
  // Timestamp of the last push. Useful for debouncing history pushes.
  let lastPush = -1;
  const treshold = options.treshold || 0;
  const trackedParameters = options.trackedParameters || [];

  // In history V2, .listen is called with the initial location.
  // In V3, you need to use .getCurrentLocation()
  if (history.getCurrentLocation) {
    currentLocation = history.getCurrentLocation();
    // We could also use location.query with the useQueries enhancer, but that
    // would require a bit more configuration from the user.
    currentState = new SearchParameters(
      getStateFromQueryString(currentLocation.search.slice(1))
    );
  }

  const stateToQueryString = (state, moreAttributes) => {
    const filters = trackedParameters.slice();
    const queryIdx = filters.indexOf('query');
    if (queryIdx !== -1 && !state.query) {
      filters.splice(queryIdx, 1);
    }
    return getQueryStringFromState(state.filter(filters), {
      moreAttributes,
      safe: true,
    });
  };

  const createLocation = (location, state) => {
    const foreignParams = getUnrecognizedParametersInQueryString(
      location.search.slice(1)
    );
    // Setting the moreAttributes option to an empty object will append an
    // unnecessary & at the end of the query string.
    const moreAttributes = Object.keys(foreignParams) > 0 ? foreignParams : null;
    return {
      ...location,
      search: `?${stateToQueryString(state, moreAttributes)}`,
    };
  };

  const unlisten = history.listen(location => {
    currentLocation = location;
    if (!currentState && !history.getCurrentLocation) {
      // Initial location. Called synchronously by listen.
      currentState = new SearchParameters(
        getStateFromQueryString(location.search.slice(1))
      );
      return;
    }
    if (ignoreThatOne) {
      ignoreThatOne = false;
      return;
    }
    currentState = new SearchParameters(
      getStateFromQueryString(location.search.slice(1))
    );
    onStateChange();
  });

  const createURL = newState => {
    if (options.createURL) {
      return options.createURL(newState, stateToQueryString);
    }
    return history.createHref(createLocation(
      currentLocation,
      newState
    ));
  };

  return {
    setState(nextState) {
      ignoreThatOne = true;
      currentState = nextState;
      const nextHref = createURL(nextState);
      const newPush = Date.now();
      if (lastPush !== -1 && newPush - lastPush <= treshold) {
        history.replace(nextHref);
      } else {
        history.push(nextHref);
      }
      lastPush = newPush;
      onStateChange();
    },
    getState() {
      return currentState;
    },
    createURL,
    unlisten,
  };
}
