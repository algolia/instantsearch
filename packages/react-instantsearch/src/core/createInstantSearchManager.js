import algoliasearchHelper, {SearchParameters} from 'algoliasearch-helper';

import createWidgetsManager from './createWidgetsManager';
import createStore from './createStore';

/**
 * Creates a new instance of the InstantSearchManager which controls the widgets and
 * trigger the search when the widgets are updated.
 * @param {string} indexName - the main index name
 * @param {object} initialState - initial widget state
 * @param {object} SearchParameters - optional additional parameters to send to the algolia API
 * @return {InstantSearchManager} a new instance of InstantSearchManager
 */
export default function createInstantSearchManager({
  indexName,
  initialState,
  algoliaClient,
  searchParameters = {},
}) {
  const helper = algoliasearchHelper(algoliaClient);

  const widgetsManager = createWidgetsManager(onWidgetsUpdate);

  const store = createStore({
    widgets: initialState,
    metadata: [],
    results: null,
    error: null,
    searching: false,
  });

  function getMetadata(state) {
    return widgetsManager.getWidgets()
      .filter(widget => Boolean(widget.getMetadata))
      .map(widget => widget.getMetadata(state));
  }

  function getSearchParameters(initialSearchParameters) {
    return widgetsManager.getWidgets()
      .filter(widget => Boolean(widget.getSearchParameters))
      .reduce(
        (res, widget) => widget.getSearchParameters(res),
        initialSearchParameters
      );
  }

  function search() {
    const baseSP = new SearchParameters({
      ...searchParameters,
      index: indexName,
    });
    const widgetSearchParameters = getSearchParameters(baseSP);

    helper
      .searchOnce(widgetSearchParameters)
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
    const metadata = getMetadata(store.getState().widgets);

    store.setState({
      ...store.getState(),
      metadata,
      searching: true,
    });

    // Since the `getSearchParameters` method of widgets also depends on props,
    // the result search parameters might have changed.
    search();
  }

  function transitionState(nextState) {
    const state = store.getState().widgets;
    return widgetsManager.getWidgets()
      .filter(widget => Boolean(widget.transitionState))
      .reduce((res, widget) =>
          widget.transitionState(state, res)
        , nextState);
  }

  function onExternalStateUpdate(nextState) {
    const metadata = getMetadata(nextState);

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
    store,
    widgetsManager,
    getWidgetsIds,
    onExternalStateUpdate,
    transitionState,
  };
}
