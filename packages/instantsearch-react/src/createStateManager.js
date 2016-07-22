import {SearchParameters} from 'algoliasearch-helper';
import {
  getQueryStringFromState,
  getStateFromQueryString,
  getUnrecognizedParametersInQueryString,
} from 'algoliasearch-helper/src/url';

function createLocation(location, state) {
  const foreignParams = getUnrecognizedParametersInQueryString(
    location.search.slice(1)
  );
  return {
    ...location,
    search: `?${getQueryStringFromState(state, {
      moreAttributes: foreignParams,
      safe: true,
    })}`,
  };
}

export default function createStateManager(history, onStateChange, options) {
  // Making location changes ourselves will still trigger the history listener
  // so we need a flag to know when to ignore those events.
  let ignoreThatOne = false;
  let state;
  let currentLocation;
  // Timestamp of the last push. Useful for debouncing history pushes.
  let lastPush = 0;
  const treshold = options.treshold || 0;

  // In history V2, .listen is called with the initial location.
  // In V3, you need to use .getCurrentLocation()
  if (history.getCurrentLocation) {
    currentLocation = history.getCurrentLocation();
    // We could also use location.query with the useQueries enhancer, but that
    // would require a bit more configuration from the user.
    state = getStateFromQueryString(location.search.slice(1));
  }

  const unlisten = history.listen(location => {
    currentLocation = location;
    if (!state && !history.getCurrentLocation) {
      // Initial location. Called synchronously by listen.
      state = new SearchParameters(
        getStateFromQueryString(location.search.slice(1))
      );
      return;
    }
    if (ignoreThatOne) {
      ignoreThatOne = false;
      return;
    }
    state = new SearchParameters(
      getStateFromQueryString(location.search.slice(1))
    );
    onStateChange();
  });

  return {
    setState(nextState) {
      ignoreThatOne = true;
      state = nextState;
      let nextHref;
      if (options.createURL) {
        nextHref = options.createURL(nextState, (urlState, moreAttributes) =>
          getQueryStringFromState(urlState, {
            moreAttributes,
            safe: true,
          })
        );
      } else {
        nextHref = history.createHref(createLocation(
          currentLocation,
          nextState
        ));
      }
      const newPush = Date.now();
      if (newPush - lastPush <= treshold) {
        history.replace(nextHref);
      } else {
        history.push(nextHref);
      }
      lastPush = newPush;
      onStateChange();
    },
    getState() {
      return state;
    },
    createURL(newState) {
      if (options.createURL) {
        return options.createURL(newState, getQueryStringFromState);
      }
      return history.createHref(createLocation(
        currentLocation,
        newState
      ));
    },
    unlisten,
  };
}
