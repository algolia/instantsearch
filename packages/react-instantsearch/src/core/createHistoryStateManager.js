import {omit, omitBy, pick} from 'lodash';
import qs from 'qs';

function getStateFromLocation(location, knownKeys = null) {
  const query = location.query || qs.parse(location.search.slice(1));
  return knownKeys !== null ? pick(query, knownKeys) : query;
}

function alphabeticalSort(a, b) {
  if (a > b) {
    return 1;
  }
  if (a === b) {
    return 0;
  }
  return -1;
}

function applyStateToLocation(location, state, knownKeys) {
  const urlState = getStateFromLocation(location);
  const unknownParameters = omit(urlState, knownKeys);
  const allParameters = {
    ...unknownParameters,
    ...state,
  };

  /*
  This is a temporary fix for the display of unselected facet in the URL.
  see: https://github.com/algolia/instantsearch.js/issues/1286
  in the long term we need to think about our strategy to handle defaultFaceting & URL management
  */
  const query = omitBy(allParameters, value => value === '');

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
  getKnownKeys,
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
    const state = getStateFromLocation(currentLocation, getKnownKeys());
    onInternalStateUpdate(state);
  };

  const createHrefForState = state => history.createHref(
    applyStateToLocation(currentLocation, state, getKnownKeys())
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
    // Since widgets aren't registered yet the first time we call this,
    // we want it to return all keys.
    getStateFromCurrentLocation: () => getStateFromLocation(currentLocation),
    onExternalStateUpdate,
    createHrefForState,
    unlisten,
  };
}
