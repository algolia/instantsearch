import { omit } from 'lodash';
import algoliasearchHelper from 'algoliasearch-helper';
import createWidgetsManager from './createWidgetsManager';
import createStore from './createStore';
import { HIGHLIGHT_TAGS } from './highlight';
import { hasMultipleIndices } from './indexUtils';

const isMultiIndexContext = widget => hasMultipleIndices(widget.context);
const isTargetedIndexEqualIndex = (widget, indexId) =>
  widget.context.multiIndexContext.targetedIndex === indexId;

// Relying on the `indexId` is a bit brittle to detect the `Index` widget.
// Since it's a class we could rely on `instanceof` or similar. We never
// had an issue though. Works for now.
const isIndexWidget = widget => Boolean(widget.props.indexId);
const isIndexWidgetEqualIndex = (widget, indexId) =>
  widget.props.indexId === indexId;

/**
 * Creates a new instance of the InstantSearchManager which controls the widgets and
 * trigger the search when the widgets are updated.
 * @param {string} indexName - the main index name
 * @param {object} initialState - initial widget state
 * @param {object} SearchParameters - optional additional parameters to send to the algolia API
 * @param {number} stalledSearchDelay - time (in ms) after the search is stalled
 * @return {InstantSearchManager} a new instance of InstantSearchManager
 */
export default function createInstantSearchManager({
  indexName,
  initialState = {},
  searchClient,
  resultsState,
  stalledSearchDelay,
}) {
  const helper = algoliasearchHelper(searchClient, indexName, {
    ...HIGHLIGHT_TAGS,
  });

  helper
    .on('search', handleNewSearch)
    .on('result', handleSearchSuccess({ indexId: indexName }))
    .on('error', handleSearchError);

  let skip = false;
  let stalledSearchTimer = null;
  let initialSearchParameters = helper.state;

  const widgetsManager = createWidgetsManager(onWidgetsUpdate);

  const store = createStore({
    widgets: initialState,
    metadata: [],
    results: resultsState || null,
    error: null,
    searching: false,
    isSearchStalled: true,
    searchingForFacetValues: false,
  });

  function skipSearch() {
    skip = true;
  }

  function updateClient(client) {
    helper.setClient(client);
    search();
  }

  function clearCache() {
    helper.clearCache();
    search();
  }

  function getMetadata(state) {
    return widgetsManager
      .getWidgets()
      .filter(widget => Boolean(widget.getMetadata))
      .map(widget => widget.getMetadata(state));
  }

  function getSearchParameters() {
    const sharedParameters = widgetsManager
      .getWidgets()
      .filter(widget => Boolean(widget.getSearchParameters))
      .filter(widget => !isMultiIndexContext(widget) && !isIndexWidget(widget))
      .reduce(
        (res, widget) => widget.getSearchParameters(res),
        initialSearchParameters
      );

    const mainParameters = widgetsManager
      .getWidgets()
      .filter(widget => Boolean(widget.getSearchParameters))
      .filter(widget => {
        const targetedIndexEqualMainIndex =
          isMultiIndexContext(widget) &&
          isTargetedIndexEqualIndex(widget, indexName);

        const subIndexEqualMainIndex =
          isIndexWidget(widget) && isIndexWidgetEqualIndex(widget, indexName);

        return targetedIndexEqualMainIndex || subIndexEqualMainIndex;
      })
      .reduce(
        (res, widget) => widget.getSearchParameters(res),
        sharedParameters
      );

    const derivedIndices = widgetsManager
      .getWidgets()
      .filter(widget => Boolean(widget.getSearchParameters))
      .filter(widget => {
        const targetedIndexNotEqualMainIndex =
          isMultiIndexContext(widget) &&
          !isTargetedIndexEqualIndex(widget, indexName);

        const subIndexNotEqualMainIndex =
          isIndexWidget(widget) && !isIndexWidgetEqualIndex(widget, indexName);

        return targetedIndexNotEqualMainIndex || subIndexNotEqualMainIndex;
      })
      .reduce((indices, widget) => {
        const indexId = isMultiIndexContext(widget)
          ? widget.context.multiIndexContext.targetedIndex
          : widget.props.indexId;

        const widgets = indices[indexId] || [];

        return {
          ...indices,
          [indexId]: widgets.concat(widget),
        };
      }, {});

    const derivedParameters = Object.keys(derivedIndices).map(indexId => ({
      parameters: derivedIndices[indexId].reduce(
        (res, widget) => widget.getSearchParameters(res),
        sharedParameters
      ),
      indexId,
    }));

    return {
      mainParameters,
      derivedParameters,
    };
  }

  function search() {
    if (!skip) {
      const { mainParameters, derivedParameters } = getSearchParameters(
        helper.state
      );

      // We have to call `slice` because the method `detach` on the derived
      // helpers mutates the value `derivedHelpers`. The `forEach` loop does
      // not iterate on each value and we're not able to correctly clear the
      // previous derived helpers (memory leak + useless requests).
      helper.derivedHelpers.slice().forEach(derivedHelper => {
        // Since we detach the derived helpers on **every** new search they
        // won't receive intermediate results in case of a stalled search.
        // Only the last result is dispatched by the derived helper because
        // they are not detached yet:
        //
        // - a -> main helper receives results
        // - ap -> main helper receives results
        // - app -> main helper + derived helpers receive results
        //
        // The quick fix is to avoid to detatch them on search but only once they
        // received the results. But it means that in case of a stalled search
        // all the derived helpers not detached yet register a new search inside
        // the helper. The number grows fast in case of a bad network and it's
        // not deterministic.
        derivedHelper.detach();
      });

      derivedParameters.forEach(({ indexId, parameters }) => {
        const derivedHelper = helper.derive(() => parameters);

        derivedHelper
          .on('result', handleSearchSuccess({ indexId }))
          .on('error', handleSearchError);
      });

      helper.setState(mainParameters);

      helper.search();
    }
  }

  function handleSearchSuccess({ indexId }) {
    return content => {
      const state = store.getState();
      const isDerivedHelpersEmpty = !helper.derivedHelpers.length;

      let results = state.results ? state.results : {};

      // Switching from mono index to multi index and vice versa must reset the
      // results to an empty object, otherwise we keep reference of stalled and
      // unused results.
      results = !isDerivedHelpersEmpty && results.getFacetByName ? {} : results;

      if (!isDerivedHelpersEmpty) {
        results[indexId] = content;
      } else {
        results = content;
      }

      const currentState = store.getState();
      let nextIsSearchStalled = currentState.isSearchStalled;
      if (!helper.hasPendingRequests()) {
        clearTimeout(stalledSearchTimer);
        stalledSearchTimer = null;
        nextIsSearchStalled = false;
      }

      const nextState = omit(
        {
          ...currentState,
          results,
          isSearchStalled: nextIsSearchStalled,
          searching: false,
          error: null,
        },
        'resultsFacetValues'
      );

      store.setState(nextState);
    };
  }

  function handleSearchError(error) {
    const currentState = store.getState();

    let nextIsSearchStalled = currentState.isSearchStalled;
    if (!helper.hasPendingRequests()) {
      clearTimeout(stalledSearchTimer);
      nextIsSearchStalled = false;
    }

    const nextState = omit(
      {
        ...currentState,
        isSearchStalled: nextIsSearchStalled,
        error,
        searching: false,
      },
      'resultsFacetValues'
    );

    store.setState(nextState);
  }

  function handleNewSearch() {
    if (!stalledSearchTimer) {
      stalledSearchTimer = setTimeout(() => {
        const nextState = omit(
          {
            ...store.getState(),
            isSearchStalled: true,
          },
          'resultsFacetValues'
        );

        store.setState(nextState);
      }, stalledSearchDelay);
    }
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

  function transitionState(nextSearchState) {
    const searchState = store.getState().widgets;

    return widgetsManager
      .getWidgets()
      .filter(widget => Boolean(widget.transitionState))
      .reduce(
        (res, widget) => widget.transitionState(searchState, res),
        nextSearchState
      );
  }

  function onExternalStateUpdate(nextSearchState) {
    const metadata = getMetadata(nextSearchState);

    store.setState({
      ...store.getState(),
      widgets: nextSearchState,
      metadata,
      searching: true,
    });

    search();
  }

  function onSearchForFacetValues({ facetName, query, maxFacetHits = 10 }) {
    // The values 1, 100 are the min / max values that the engine accepts.
    // see: https://www.algolia.com/doc/api-reference/api-parameters/maxFacetHits
    const maxFacetHitsWithinRange = Math.max(1, Math.min(maxFacetHits, 100));

    store.setState({
      ...store.getState(),
      searchingForFacetValues: true,
    });

    helper
      .searchForFacetValues(facetName, query, maxFacetHitsWithinRange)
      .then(
        content => {
          store.setState({
            ...store.getState(),
            error: null,
            searchingForFacetValues: false,
            resultsFacetValues: {
              ...store.getState().resultsFacetValues,
              [facetName]: content.facetHits,
              query,
            },
          });
        },
        error => {
          store.setState({
            ...store.getState(),
            searchingForFacetValues: false,
            error,
          });
        }
      )
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

  function updateIndex(newIndex) {
    initialSearchParameters = initialSearchParameters.setIndex(newIndex);
    search();
  }

  function getWidgetsIds() {
    return store
      .getState()
      .metadata.reduce(
        (res, meta) =>
          typeof meta.id !== 'undefined' ? res.concat(meta.id) : res,
        []
      );
  }

  return {
    store,
    widgetsManager,
    getWidgetsIds,
    getSearchParameters,
    onSearchForFacetValues,
    onExternalStateUpdate,
    transitionState,
    updateClient,
    updateIndex,
    clearCache,
    skipSearch,
  };
}
