import { Connector } from '../../types';
import { noop } from '../../lib/utils';

export type SmartSortConnectorParams = {};

type Refine = (relevancyStrictness: number) => void;

export type SmartSortRendererOptions = {
  isSmartSorted: boolean;
  isVirtualReplica: boolean;
  refine: Refine;
};

export type SmartSortConnector = Connector<
  SmartSortRendererOptions,
  SmartSortConnectorParams
>;

const connectSmartSort: SmartSortConnector = function connectSmartSort(
  renderFn = noop,
  unmountFn = noop
) {
  return widgetParams => {
    type ConnectorState = {
      refine?: Refine;
    };

    const connectorState: ConnectorState = {};

    return {
      $$type: 'ais.smartSort',

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
          smartSort: this.getWidgetRenderState(renderOptions),
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
          isSmartSorted:
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
          uiState.smartSort?.relevancyStrictness ?? state.relevancyStrictness
        );
      },

      getWidgetUiState(uiState, { searchParameters }) {
        return {
          ...uiState,
          smartSort: {
            ...uiState.smartSort,
            relevancyStrictness: searchParameters.relevancyStrictness,
          },
        };
      },
    };
  };
};

export default connectSmartSort;
