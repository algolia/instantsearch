import type { InstantSearch } from '../../instantsearch';
import type { UiState, Widget, IndexWidget } from '../../types';

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
    createURL: parent.createURL,
    scopedResults: [],
    status: instantSearchInstance.status,
    error: instantSearchInstance.error,
  };
}

export function createRenderArgs(
  instantSearchInstance: InstantSearch,
  parent: IndexWidget,
  widget: IndexWidget | Widget
) {
  const results = parent.getResultsForWidget(widget);
  const helper = parent.getHelper()!;

  return {
    helper,
    parent,
    instantSearchInstance,
    results,
    scopedResults: parent.getScopedResults(),
    state: results && '_state' in results ? results._state : helper.state,
    renderState: instantSearchInstance.renderState,
    createURL: parent.createURL,
    status: instantSearchInstance.status,
    error: instantSearchInstance.error,
  };
}
