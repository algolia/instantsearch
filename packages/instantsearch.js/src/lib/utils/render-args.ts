import type { InstantSearch, UiState } from '../../types';
import type { IndexWidget } from '../../widgets/index/index';
import algoliasearchHelper from 'algoliasearch-helper';

export function createInitArgs(
  instantSearchInstance: InstantSearch,
  parent: IndexWidget,
  uiState: UiState
) {
  const helper = parent.getHelper()!;
  return {
    uiState,
    helper,
    parent,
    instantSearchInstance,
    state: helper.state,
    renderState: instantSearchInstance.renderState,
    templatesConfig: instantSearchInstance.templatesConfig,
    createURL: parent.createURL,
    scopedResults: [],
    searchMetadata: {
      isSearchStalled: instantSearchInstance.status === 'stalled',
    },
    status: instantSearchInstance.status,
    error: instantSearchInstance.error,
  };
}

export function createRenderArgs(
  instantSearchInstance: InstantSearch,
  parent: IndexWidget
) {
  // Always make results out of the current state, this enables optimistic UI
  // TODO: does this need to be conditional
  const results = new algoliasearchHelper.SearchResults(
    parent.getHelper()!.state,
    parent.getResults()!._rawResults
  );

  return {
    helper: parent.getHelper()!,
    parent,
    instantSearchInstance,
    results,
    scopedResults: parent.getScopedResults(),
    state: results._state,
    renderState: instantSearchInstance.renderState,
    templatesConfig: instantSearchInstance.templatesConfig,
    createURL: parent.createURL,
    searchMetadata: {
      isSearchStalled: instantSearchInstance.status === 'stalled',
    },
    status: instantSearchInstance.status,
    error: instantSearchInstance.error,
  };
}
