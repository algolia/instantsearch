import { Connector } from '../../types';
import { createDocumentationMessageGenerator, noop } from '../../lib/utils';

export type SmartSortConnectorParams = {
  relevancyStrictness?: number;
};

type Refine = (relevancyStrictness: number) => void;

export type SmartSortRendererOptions = {
  isSmartSorted: boolean;
  refine: Refine;
};

const withUsage = createDocumentationMessageGenerator({
  name: 'smartSort',
  connector: true,
});

export type SmartSortConnector = Connector<
  SmartSortRendererOptions,
  SmartSortConnectorParams
>;

const connectSmartSort: SmartSortConnector = function connectSmartSort(
  renderFn = noop,
  unmountFn = noop
) {
  return widgetParams => {
    if (
      typeof widgetParams.relevancyStrictness !== 'undefined' &&
      (widgetParams.relevancyStrictness < 0 ||
        widgetParams.relevancyStrictness > 100)
    ) {
      throw new Error(
        withUsage('The `relevancyStrictness` option must be between 0 and 100.')
      );
    }

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
            appliedRelevancyStrictness > 0 && appliedRelevancyStrictness <= 100,
          refine: connectorState.refine,
          widgetParams,
        };
      },

      getWidgetSearchParameters(state, { uiState }) {
        return state.setQueryParameter(
          'relevancyStrictness',
          uiState.smartSort?.relevancyStrictness ??
            state.relevancyStrictness ??
            widgetParams.relevancyStrictness
        );
      },

      getWidgetUiState(uiState, { searchParameters }) {
        return {
          ...uiState,
          smartSort: {
            ...uiState.smartSort,
            relevancyStrictness:
              searchParameters.relevancyStrictness ??
              widgetParams.relevancyStrictness,
          },
        };
      },
    };
  };
};

export default connectSmartSort;
