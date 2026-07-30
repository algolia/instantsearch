import algoliasearchHelper from 'algoliasearch-helper';

/*
 * PoC — synchronous initial render state, ported from
 * `react-instantsearch-core` (`useConnector`'s `useState` initializer +
 * `getIndexSearchResults` + `createSearchResults`).
 *
 * One Vue-specific addition: Vue mounts widgets in `created()`/`setup()`,
 * *before* `instantsearch.start()` runs (root `mounted` + `$nextTick`), so
 * unlike React there is no helper yet on first mount. The pre-start branch
 * derives an equivalent helper from the initial ui state.
 *
 * NOTE (packaging): `algoliasearch-helper` is only a devDependency of
 * vue-instantsearch today; shipping this requires promoting it (or hosting
 * these helpers in a neutral home) — an RFC point.
 */

export function createSearchResults(state) {
  return new algoliasearchHelper.SearchResults(
    state,
    [
      {
        query: state.query || '',
        page: state.page || 0,
        hitsPerPage: state.hitsPerPage || 20,
        hits: [],
        nbHits: 0,
        nbPages: 0,
        params: '',
        exhaustiveNbHits: true,
        exhaustiveFacetsCount: true,
        processingTimeMS: 0,
        index: state.index,
      },
    ],
    {
      // used by connectors to prevent persisting these results
      __isArtificial: true,
    }
  );
}

function getIndexSearchResults(indexWidget) {
  const helper = indexWidget.getHelper();
  const results =
    // On SSR, we get the results injected on the Index.
    indexWidget.getResults() ||
    // On the browser, we create fallback results based on the helper state.
    createSearchResults(helper.state);
  const scopedResults = indexWidget.getScopedResults().map((scopedResult) => {
    const fallbackResults =
      scopedResult.indexId === indexWidget.getIndexId()
        ? results
        : createSearchResults(scopedResult.helper.state);

    return {
      ...scopedResult,
      // We keep `results` from being `null`.
      results: scopedResult.results || fallbackResults,
    };
  });

  return { results, scopedResults };
}

export function getInitialRenderState({
  widget: realWidget,
  parentIndex,
  instantSearchInstance,
  createProbeWidget,
}) {
  if (!realWidget.getWidgetRenderState) {
    return {};
  }

  const startedHelper = parentIndex.getHelper();
  // Connectors cache function refs (refine, clear…) on the widget, closing
  // over the first helper `getWidgetRenderState` sees. Pre-start that helper
  // is a detached one, so the state is computed on a throwaway probe widget
  // to avoid poisoning the real widget's cache.
  const widget = startedHelper ? realWidget : createProbeWidget();
  let helper;
  let results;
  let scopedResults;

  if (startedHelper) {
    // Same path as React: the instance has started, reuse the index helper.
    const uiState = parentIndex.getWidgetUiState({})[parentIndex.getIndexId()];
    startedHelper.state =
      (widget.getWidgetSearchParameters &&
        widget.getWidgetSearchParameters(startedHelper.state, { uiState })) ||
      startedHelper.state;
    helper = startedHelper;
    const indexResults = getIndexSearchResults(parentIndex);
    results = indexResults.results;
    scopedResults = indexResults.scopedResults;
  } else {
    // Pre-start branch (Vue-only): derive a detached helper from the widget's
    // search parameters and the instance's initial ui state.
    const uiState =
      (instantSearchInstance._initialUiState || {})[
        parentIndex.getIndexId()
      ] || {};
    const initialParameters = new algoliasearchHelper.SearchParameters({
      index: parentIndex.getIndexName(),
    });
    const searchParameters =
      (widget.getWidgetSearchParameters &&
        widget.getWidgetSearchParameters(initialParameters, { uiState })) ||
      initialParameters;
    helper = algoliasearchHelper(
      instantSearchInstance.client,
      parentIndex.getIndexName(),
      searchParameters
    );
    results = createSearchResults(helper.state);
    scopedResults = [];
  }

  // We get the widget render state by providing the same parameters as
  // InstantSearch provides to the widget's `render` method.
  const { widgetParams, ...renderState } = widget.getWidgetRenderState({
    helper,
    parent: parentIndex,
    instantSearchInstance,
    results,
    scopedResults,
    state: helper.state,
    renderState: instantSearchInstance.renderState,
    templatesConfig: instantSearchInstance.templatesConfig,
    // `parentIndex.createURL` throws before the instance has started.
    createURL: startedHelper ? parentIndex.createURL : () => '#',
    searchMetadata: {
      isSearchStalled: instantSearchInstance.status === 'stalled',
    },
    status: instantSearchInstance.status,
    error: instantSearchInstance.error,
  });

  return renderState;
}
