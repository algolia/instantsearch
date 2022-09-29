import type { InstantSearch, UiState } from '../../types';
import type { IndexWidget } from '../../widgets/index/index';

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
      isSearchStalled: instantSearchInstance._isSearchStalled,
    },
  };
}

export function createRenderArgs(
  instantSearchInstance: InstantSearch,
  parent: IndexWidget
) {
  const results = parent.getResults()!;

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
      isSearchStalled: instantSearchInstance._isSearchStalled,
    },
  };
}
