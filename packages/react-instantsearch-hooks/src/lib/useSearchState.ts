import { useConnector } from '../hooks/useConnector';

import type { Connector, UiState } from 'instantsearch.js';

export type SearchStateRenderState<TUiState extends UiState> = {
  uiState: TUiState;
  indexUiState: TUiState[keyof TUiState];
  setUiState(
    uiState: TUiState | ((previousUiState: TUiState) => TUiState)
  ): void;
  setIndexUiState(
    indexUiState:
      | TUiState[keyof TUiState]
      | ((
          previousIndexUiState: TUiState[keyof UiState]
        ) => TUiState[keyof UiState])
  ): void;
};

type SearchStateWidgetDescription<TUiState extends UiState = UiState> = {
  $$type: 'ais.searchState';
  renderState: SearchStateRenderState<TUiState>;
};

type SearchStateConnector<TUiState extends UiState = UiState> = Connector<
  SearchStateWidgetDescription<TUiState>,
  never
>;

const connectSearchState: SearchStateConnector = (renderFn) => {
  return (widgetParams) => {
    let setUiState: SearchStateRenderState<UiState>['setUiState'];
    let setIndexUiState: SearchStateRenderState<UiState>['setIndexUiState'];
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

export function useSearchState<TUiState extends UiState = UiState>() {
  return useConnector<never, SearchStateWidgetDescription<TUiState>>(
    connectSearchState as unknown as SearchStateConnector<TUiState>
  );
}
