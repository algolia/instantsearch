import {omit} from 'lodash';
import qs from 'qs';

function getStateFromLocation(location) {
  if (location.query) {
    return location.query;
  }
  // We could also use location.query with the useQueries enhancer, but that
  // would require a bit more configuration from the user.
  return qs.parse(location.search.slice(1));
}

function alphabeticalSort(a, b) {
  if (a > b) {
    return 1;
  }
  if (a === b) {
    return 0;
  }
  return 1;
}

function applyStateToLocation(location, state, knownKeys) {
  const urlState = getStateFromLocation(location);
  const unknownParameters = omit(urlState, knownKeys);
  const query = {
    ...unknownParameters,
    ...state,
  };
  if (location.query) {
    return {
      ...location,
      query,
    };
  }
  return {
    ...location,
    search: query ? `?${qs.stringify(query, {sort: alphabeticalSort})}` : '',
  };
}

export default function createHistoryStateManager({
  history,
  threshold,
  onInternalStateUpdate,
  getIgnoredKeys,
}) {
  let currentLocation = null;
  // In history V2, .listen is called with the initial location.
  // In V3, you need to use .getCurrentLocation()
  if (history.getCurrentLocation) {
    currentLocation = history.getCurrentLocation();
  }

  let lastPush = -1;
  let skipNextLocationUpdate = false;

  const onLocationChange = location => {
    if (currentLocation === null && !history.getCurrentLocation) {
      // Initial location. Called synchronously by listen.
      currentLocation = location;
      return;
    }
    currentLocation = location;
    if (skipNextLocationUpdate) {
      skipNextLocationUpdate = false;
      return;
    }
    const state = getStateFromLocation(currentLocation);
    onInternalStateUpdate(state);
  };

  const createHrefForState = state => history.createHref(
    applyStateToLocation(currentLocation, state, getIgnoredKeys())
  );

  const onExternalStateUpdate = state => {
    const href = createHrefForState(state);
    skipNextLocationUpdate = true;
    const newPush = Date.now();
    if (lastPush !== -1 && newPush - lastPush <= threshold) {
      history.replace(href);
    } else {
      history.push(href);
    }
    lastPush = newPush;
  };

  const unlisten = history.listen(onLocationChange);

  return {
    getStateFromCurrentLocation: () => getStateFromLocation(currentLocation),
    onExternalStateUpdate,
    createHrefForState,
    unlisten,
  };
}
