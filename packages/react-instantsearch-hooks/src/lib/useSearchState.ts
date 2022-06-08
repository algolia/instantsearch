import { useConnector } from '../hooks/useConnector';

import type { Connector, IndexUiState, UiState } from 'instantsearch.js';

type SearchStateRenderState = {
  uiState: UiState;
  indexUiState: IndexUiState;
  setUiState(uiState: UiState | ((previousUiState: UiState) => UiState)): void;
  setIndexUiState(
    indexUiState:
      | IndexUiState
      | ((previousIndexUiState: IndexUiState) => IndexUiState)
  ): void;
};

type SearchStateWidgetDescription = {
  $$type: 'ais.searchState';
  renderState: SearchStateRenderState;
};

const connectSearchState: Connector<SearchStateWidgetDescription, never> = (
  renderFn
) => {
  return (widgetParams) => {
    let setUiState: SearchStateRenderState['setUiState'];
    let setIndexUiState: SearchStateRenderState['setIndexUiState'];
    return {
      $$type: 'ais.searchState',
      getWidgetRenderState({ instantSearchInstance, parent }) {
        const indexId = parent!.getIndexId();
        const uiState = instantSearchInstance.getUiState();
        const indexUiState = uiState[indexId];
        if (!setUiState) {
          setUiState = instantSearchInstance.setUiState.bind(
            instantSearchInstance
          );
        }
        if (!setIndexUiState) {
          setIndexUiState = (nextUiState) => {
            setUiState((prevUiState) => ({
              ...prevUiState,
              [indexId]:
                typeof nextUiState === 'function'
                  ? nextUiState(prevUiState[indexId])
                  : nextUiState,
            }));
          };
        }

        return {
          uiState,
          indexUiState,
          setUiState,
          setIndexUiState,
          widgetParams,
        };
      },
      render(renderOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState!(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },
      dispose() {},
    };
  };
};

export function useSearchState() {
  return useConnector(connectSearchState);
}
