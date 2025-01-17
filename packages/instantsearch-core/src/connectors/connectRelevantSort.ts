import { noop } from '../lib/public';

import type { Connector, WidgetRenderState } from '../types';

export type RelevantSortConnectorParams = Record<string, unknown>;

type Refine = (relevancyStrictness: number | undefined) => void;

export type RelevantSortRenderState = {
  /**
   * Indicates if it has appliedRelevancyStrictness greater than zero
   */
  isRelevantSorted: boolean;

  /**
   * Indicates if the results come from a virtual replica
   */
  isVirtualReplica: boolean;

  /**
   * Indicates if search state can be refined
   */
  canRefine: boolean;

  /**
   * Sets the value as relevancyStrictness and trigger a new search
   */
  refine: Refine;
};

export type RelevantSortWidgetDescription = {
  $$type: 'ais.relevantSort';
  renderState: RelevantSortRenderState;
  indexRenderState: {
    relevantSort: WidgetRenderState<
      RelevantSortRenderState,
      RelevantSortConnectorParams
    >;
  };
  indexUiState: {
    relevantSort: number;
  };
};

export type RelevantSortConnector = Connector<
  RelevantSortWidgetDescription,
  RelevantSortConnectorParams
>;

export const connectRelevantSort: RelevantSortConnector =
  function connectRelevantSort(renderFn = noop, unmountFn = noop) {
    return (widgetParams) => {
      type ConnectorState = {
        refine?: Refine;
      };

      const connectorState: ConnectorState = {};

      return {
        $$type: 'ais.relevantSort',

        init(initOptions) {
          const { instantSearchInstance } = initOptions;
          renderFn(
            {
              ...this.getWidgetRenderState(initOptions),
              instantSearchInstance,
            },
            true
          );
        },

        render(renderOptions) {
          const { instantSearchInstance } = renderOptions;

          renderFn(
            {
              ...this.getWidgetRenderState(renderOptions),
              instantSearchInstance,
            },
            false
          );
        },

        dispose() {
          unmountFn();
        },

        getRenderState(renderState, renderOptions) {
          return {
            ...renderState,
            relevantSort: this.getWidgetRenderState(renderOptions),
          };
        },

        getWidgetRenderState({ results, helper }) {
          if (!connectorState.refine) {
            connectorState.refine = (relevancyStrictness) => {
              helper
                .setQueryParameter('relevancyStrictness', relevancyStrictness)
                .search();
            };
          }

          const { appliedRelevancyStrictness } = results || {};

          const isVirtualReplica = appliedRelevancyStrictness !== undefined;

          return {
            isRelevantSorted:
              typeof appliedRelevancyStrictness !== 'undefined' &&
              appliedRelevancyStrictness > 0,
            isVirtualReplica,
            canRefine: isVirtualReplica,
            refine: connectorState.refine,
            widgetParams,
          };
        },

        getWidgetSearchParameters(state, { uiState }) {
          return state.setQueryParameter(
            'relevancyStrictness',
            uiState.relevantSort ?? state.relevancyStrictness
          );
        },

        getWidgetUiState(uiState, { searchParameters }) {
          return {
            ...uiState,
            relevantSort:
              searchParameters.relevancyStrictness || uiState.relevantSort,
          };
        },
      };
    };
  };
