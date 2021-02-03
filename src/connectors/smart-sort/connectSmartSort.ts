import { Connector } from '../../types';
import {
  createDocumentationMessageGenerator,
  mergeSearchParameters,
  noop,
} from '../../lib/utils';
import algoliasearchHelper from 'algoliasearch-helper';

export type SmartSortConnectorParams = {
  relevancyStrictness?: number;
};

export type SmartSortRendererOptions = {
  isSmartSorted: boolean;
  refine: (relevancyStrictness: number) => void;
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

        // @TODO: remove @ts-ignore once we update the helper to include relevancyStrictness.
        // @ts-ignore
        return state.setQueryParameter('relevancyStrictness', undefined);
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          smartSort: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ results, helper }) {
        // @TODO: remove @ts-ignore once we update the helper to include appliedRelevancyStrictness.
        // @ts-ignore
        const { appliedRelevancyStrictness } = results || {};

        return {
          isSmartSorted:
            typeof appliedRelevancyStrictness !== 'undefined' &&
            appliedRelevancyStrictness > 0 &&
            appliedRelevancyStrictness <= 100,
          refine: relevancyStrictness => {
            helper
              .setQueryParameter('relevancyStrictness', relevancyStrictness)
              .search();
          },
          widgetParams,
        };
      },

      getWidgetSearchParameters(state, { uiState }) {
        return mergeSearchParameters(
          new algoliasearchHelper.SearchParameters({
            // @TODO: remove @ts-ignore once we update the helper to include relevancyStrictness.
            // @ts-ignore
            relevancyStrictness: widgetParams.relevancyStrictness,
          }),
          state,
          new algoliasearchHelper.SearchParameters({
            // @TODO: remove @ts-ignore once we update the helper to include relevancyStrictness.
            // @ts-ignore
            relevancyStrictness: uiState.smartSort?.relevancyStrictness,
          })
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
