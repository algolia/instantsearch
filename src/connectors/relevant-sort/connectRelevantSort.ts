import { Connector } from '../../types';
import { noop } from '../../lib/utils';

export type RelevantSortConnectorParams = {};

type Refine = (relevancyStrictness: number) => void;

export type RelevantSortRendererOptions = {
  isRelevantSorted: boolean;
  isVirtualReplica: boolean;
  refine: Refine;
};

export type RelevantSortConnector = Connector<
  RelevantSortRendererOptions,
  RelevantSortConnectorParams
>;

const connectRelevantSort: RelevantSortConnector = function connectRelevantSort(
  renderFn = noop,
  unmountFn = noop
) {
  return widgetParams => {
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

      dispose({ state }) {
        unmountFn();

        return state.setQueryParameter('relevancyStrictness', undefined);
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          relevantSort: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ results, helper }) {
        if (!connectorState.refine) {
          connectorState.refine = (relevancyStrictness: number | undefined) => {
            helper
              .setQueryParameter('relevancyStrictness', relevancyStrictness)
              .search();
          };
        }

        const { appliedRelevancyStrictness } = results || {};

        return {
          isRelevantSorted:
            typeof appliedRelevancyStrictness !== 'undefined' &&
            appliedRelevancyStrictness > 0,
          isVirtualReplica: appliedRelevancyStrictness !== undefined,
          refine: connectorState.refine,
          widgetParams,
        };
      },

      getWidgetSearchParameters(state, { uiState }) {
        return state.setQueryParameter(
          'relevancyStrictness',
          uiState.relevantSort?.relevancyStrictness ?? state.relevancyStrictness
        );
      },

      getWidgetUiState(uiState, { searchParameters }) {
        return {
          ...uiState,
          relevantSort: {
            ...uiState.relevantSort,
            relevancyStrictness: searchParameters.relevancyStrictness,
          },
        };
      },
    };
  };
};

export default connectRelevantSort;
