import algoliasearchHelper from 'algoliasearch-helper';
import { mergeSearchParameters, resolveSearchParameters } from './utils';
import { Index, isIndexWidget } from '../widgets/index/index';
import { InstantSearch, Client, Widget } from '../types';

type SearchManagerProps = {
  searchParameters: algoliasearchHelper.PlainSearchParameters & {
    index: string;
  };
  searchIndex: Index;
  instantSearchInstance: InstantSearch;
  getIsIndexInitialized(): boolean;
  onChange(params: {
    state: algoliasearchHelper.SearchParameters;
    results: algoliasearchHelper.SearchResults;
    isPageReset: boolean;
  }): void;
  onSearch(params: {
    state: algoliasearchHelper.SearchParameters;
    results: algoliasearchHelper.SearchResults;
  }): void;
};

/**
 * Create a search manager that manages the state of its search index.
 */
export function createSearchManager({
  searchParameters,
  searchIndex,
  instantSearchInstance,
  getIsIndexInitialized,
  onChange,
  onSearch,
}: SearchManagerProps) {
  let isActive = true;
  const helper = algoliasearchHelper(
    {} as Client,
    searchParameters.index,
    searchParameters
  );
  const sequencer = instantSearchInstance.mainHelper!;

  // We forward the call to `search` to the "main" instance of the Helper
  // which is responsible for managing the queries (it's the only one that is
  // aware of the `searchClient`).
  helper.search = () => {
    if (instantSearchInstance.onStateChange) {
      instantSearchInstance.onStateChange!({
        uiState: instantSearchInstance.mainIndex.getWidgetState({}),
        setUiState: instantSearchInstance.setUiState.bind(
          instantSearchInstance
        ),
      });

      // We don't trigger a search when controlled because it becomes the
      // responsibility of `setUiState`.
      return sequencer;
    }

    return sequencer.search();
  };

  // We use the same pattern as `search` for `searchForFacetValues`.
  helper.searchForFacetValues = (
    facetName,
    facetValue,
    maxFacetHits,
    userState: algoliasearchHelper.PlainSearchParameters
  ) => {
    const state = helper.state.setQueryParameters(userState);

    return sequencer.searchForFacetValues(
      facetName,
      facetValue,
      maxFacetHits,
      state
    );
  };

  const derivedHelper = sequencer.derive(() =>
    mergeSearchParameters(...resolveSearchParameters(searchIndex))
  );

  derivedHelper.on('search', params => {
    // The search manager does not manage the "staleness" of the search. It's the
    // responsibility of the main instance.
    // It does not make sense to manage it at the index level because it's
    // either all of the indices or none of the indices are stalled.
    // The queries are performed into a single network request.
    instantSearchInstance.scheduleStalledRender();

    onSearch(params);
  });

  derivedHelper.on('result', ({ results }) => {
    // The index does not render the results; it schedules a new render
    // to let all the other indices emit their own results. It allows us to
    // run the render process in one pass.
    instantSearchInstance.scheduleRender();

    // The derived helper is the one which triggers searches, but the helper
    // which is exposed (via `instantSearchInstance.helper`), doesn't search.
    // Thus it does not have access to `lastResults`, which was used before v4
    // (pre-Federated Search).
    helper.lastResults = results;
  });

  helper.on('change', params => {
    if (params.isPageReset) {
      resetPageFromWidgets(searchIndex.getWidgets());
    }

    // Subscribe to the helper state changes to update the `uiState` once
    // widgets are initialized.
    // Before the first render, state changes are part of the configuration step.
    // This is mainly for backward compatibility with custom widgets.
    // When the subscription happens before the `init` step, the (static)
    // configuration of the widget is pushed in the URL, which is what we want to avoid.
    // See: https://github.com/algolia/instantsearch.js/pull/994/commits/4a672ae3fd78809e213de0368549ef12e9dc9454
    if (getIsIndexInitialized()) {
      onChange(params);

      // We don't trigger an internal change when controlled because it
      // becomes the responsibility of `setUiState`.
      if (!instantSearchInstance.onStateChange) {
        instantSearchInstance.onInternalStateChange();
      }
    }
  });

  return {
    getState() {
      return helper.state;
    },
    getResults() {
      return derivedHelper.lastResults;
    },
    getLegacyHelper() {
      return isActive ? helper : null;
    },
    setState(state: algoliasearchHelper.PlainSearchParameters) {
      return helper.setState(state);
    },
    teardown() {
      isActive = false;
      helper.removeAllListeners();
      derivedHelper.detach();
    },
  };
}

function resetPageFromWidgets(widgets: Widget[]): void {
  const indexWidgets = widgets.filter(isIndexWidget);

  if (indexWidgets.length === 0) {
    return;
  }

  indexWidgets.forEach(widget => {
    const widgetHelper = widget.getHelper()!;

    // @ts-ignore @TODO: remove "ts-ignore" once `resetPage()` is typed in the helper
    widgetHelper.setState(widgetHelper.state.resetPage());

    resetPageFromWidgets(widget.getWidgets());
  });
}
