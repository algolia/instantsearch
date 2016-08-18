import algoliasearch from 'algoliasearch';
import algoliasearchHelper, {SearchParameters} from 'algoliasearch-helper';
import {omit, isEqual, includes} from 'lodash';

import createWidgetsManager from './createWidgetsManager';
import createStore from './createStore';

export default function createInstantSearchManager({
  appId,
  apiKey,
  indexName,

  initialState,
  createHrefForState: optsCHFS,
  onInternalStateUpdate: optsOISU,
}) {
  const client = algoliasearch(appId, apiKey);
  const helper = algoliasearchHelper(client);

  const store = createStore({
    widgets: initialState,
    metadata: [],
    results: null,
    error: null,
    searching: false,
  });

  const widgetsManager = createWidgetsManager(onWidgetsUpdate);

  function search() {
    const baseSP = new SearchParameters({index: indexName});
    // @TODO: Provide a way to configure base SearchParameters.
    // We previously had a `configureSearchParameters : SP -> SP` option.
    // We could also just have a `baseSearchParameters : SP` option.
    const searchParameters = widgetsManager.getSearchParameters(baseSP);

    helper.searchOnce(searchParameters)
      .then(({content}) => {
        store.setState({
          ...store.getState(),
          results: content,
          searching: false,
        });
      }, error => {
        store.setState({
          ...store.getState(),
          error,
          searching: false,
        });
      })
      .catch(error => {
        // Since setState is synchronous, any error that occurs in the render of a
        // component will be swallowed by this promise.
        // This is a trick to make the error show up correctly in the console.
        // See http://stackoverflow.com/a/30741722/969302
        setTimeout(() => {
          throw error;
        });
      });
  }

  // Called whenever a widget has been rendered with new props.
  function onWidgetsUpdate() {
    const widgetsState = store.getState().widgets;
    const metadata = widgetsManager.getMetadata(widgetsState);

    store.setState({
      ...store.getState(),
      metadata,
      searching: true,
    });

    // Since the `getSearchParameters` method of widgets also depends on props,
    // the result search parameters might have changed.
    search();
  }

  function transitionState(state, nextState) {
    // Reset all `clearOnChange` widget states that haven't changed between the
    // previous state and the new one.
    // The main (and only) use case is the state corresponding to the current
    // page, which we need to reset whenever any other widget state changes.
    const clearIds = store.getState().metadata.reduce((res, meta) =>
      meta.clearOnChange ? res.concat(meta.id) : res
    , []);
    const changedKeys = Object.keys(nextState).filter(key =>
      !isEqual(state[key], nextState[key])
    );
    nextState = clearIds.reduce((res, clearId) =>
      changedKeys.length > 0 && !includes(changedKeys, clearId) ?
        omit(res, clearId) :
        res
    , nextState);
    return nextState;
  }

  function onInternalStateUpdate(nextState) {
    nextState = transitionState(store.getState().widgets, nextState);

    // We don't want to update the state in store just yet, but instead forward
    // it to the creator of this instance. Which will in turn need to call
    // `onExternalStateUpdate` in order to update the state in store.
    optsOISU(nextState);
  }

  function createHrefForState(state) {
    state = transitionState(store.getState().widgets, state);

    return optsCHFS(state);
  }

  function onExternalStateUpdate(nextState) {
    const metadata = widgetsManager.getMetadata(nextState);

    store.setState({
      ...store.getState(),
      widgets: nextState,
      metadata,
      searching: true,
    });

    search();
  }

  function getWidgetsIds() {
    return store.getState().metadata.reduce((res, meta) =>
      typeof meta.id !== 'undefined' ? res.concat(meta.id) : res
    , []);
  }

  return {
    context: {
      store,
      widgetsManager,
      onInternalStateUpdate,
      createHrefForState,
    },
    getWidgetsIds,
    onExternalStateUpdate,
  };
}
