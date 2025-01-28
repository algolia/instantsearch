import { isIndexWidget } from '../public/isIndexWidget';

import { checkIndexUiState } from './checkIndexUiState';

import type { UiState, IndexWidget } from '../../types';

export function setIndexHelperState<TUiState extends UiState>(
  finalUiState: TUiState,
  indexWidget: IndexWidget
) {
  const nextIndexUiState = finalUiState[indexWidget.getIndexId()] || {};

  if (__DEV__) {
    checkIndexUiState({
      index: indexWidget,
      indexUiState: nextIndexUiState,
    });
  }

  indexWidget.getHelper()!.setState(
    indexWidget.getWidgetSearchParameters(indexWidget.getHelper()!.state, {
      uiState: nextIndexUiState,
    })
  );

  indexWidget
    .getWidgets()
    .filter(isIndexWidget)
    .forEach((widget) => setIndexHelperState(finalUiState, widget));
}
