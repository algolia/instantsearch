import type { UiState } from '../../types';
import { isIndexWidget } from '../../widgets/index/index';
import type { IndexWidget } from '../../widgets/index/index';
import { checkIndexUiState } from './checkIndexUiState';

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
