import algoliasearchHelper from 'algoliasearch-helper';

import {
  createDocumentationMessageGenerator,
  isPlainObject,
  noop,
} from '../lib/public';
import { mergeSearchParameters } from '../lib/utils';

import type { InstantSearch } from '../instantsearch';
import type { Connector, WidgetRenderState } from '../types';
import type { PlainSearchParameters } from 'algoliasearch-helper';

/**
 * Refine the given search parameters.
 */
type Refine = (searchParameters: PlainSearchParameters) => void;

export type ConfigureConnectorParams = {
  /**
   * A list of [search parameters](https://www.algolia.com/doc/api-reference/search-api-parameters/)
   * to enable when the widget mounts.
   */
  searchParameters: PlainSearchParameters;
};

export type ConfigureRenderState = {
  /**
   * Refine the given search parameters.
   */
  refine: Refine;
};

const withUsage = createDocumentationMessageGenerator({
  name: 'configure',
  connector: true,
});

export type ConfigureWidgetDescription = {
  $$type: 'ais.configure';
  renderState: ConfigureRenderState;
  indexRenderState: {
    configure: WidgetRenderState<
      ConfigureRenderState,
      ConfigureConnectorParams
    >;
  };
};

export type ConfigureConnector = Connector<
  ConfigureWidgetDescription,
  ConfigureConnectorParams
>;

export const connectConfigure: ConfigureConnector = function connectConfigure(
  renderFn = noop,
  unmountFn = noop
) {
  return (widgetParams) => {
    if (!widgetParams || !isPlainObject(widgetParams.searchParameters)) {
      throw new Error(
        withUsage('The `searchParameters` option expects an object.')
      );
    }

    type ConnectorState = {
      refine?: Refine;
    };

    const connectorState: ConnectorState = {};

    function refine(search: InstantSearch): Refine {
      return (searchParameters: PlainSearchParameters) => {
        // Update original `widgetParams.searchParameters` to the new refined one
        widgetParams.searchParameters = searchParameters;
        // Trigger a search with the new parameters
        search.setUiState((prev) => prev);
      };
    }

    return {
      $$type: 'ais.configure',

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
        const widgetRenderState = this.getWidgetRenderState(renderOptions);
        return {
          ...renderState,
          configure: {
            ...widgetRenderState,
            widgetParams: {
              ...widgetRenderState.widgetParams,
              searchParameters: mergeSearchParameters(
                new algoliasearchHelper.SearchParameters(
                  renderState.configure?.widgetParams.searchParameters
                ),
                new algoliasearchHelper.SearchParameters(
                  widgetRenderState.widgetParams.searchParameters
                )
              ).getQueryParams(),
            },
          },
        };
      },

      getWidgetRenderState({ instantSearchInstance }) {
        if (!connectorState.refine) {
          connectorState.refine = refine(instantSearchInstance);
        }

        return {
          refine: connectorState.refine,
          widgetParams,
        };
      },

      getWidgetSearchParameters(state) {
        return mergeSearchParameters(
          state,
          new algoliasearchHelper.SearchParameters(
            widgetParams.searchParameters
          )
        );
      },

      getWidgetUiState(uiState) {
        // Configure is not part of the UI state, its internal state is what applies
        // the parameters to the search. These are not synced with the routing.
        return uiState;
      },
    };
  };
};
