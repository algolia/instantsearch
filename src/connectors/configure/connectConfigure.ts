import algoliasearchHelper, {
  SearchParameters,
  PlainSearchParameters,
  AlgoliaSearchHelper,
} from 'algoliasearch-helper';
import { Connector } from '../../types';
import {
  createDocumentationMessageGenerator,
  isPlainObject,
  mergeSearchParameters,
  noop,
} from '../../lib/utils';

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

export type ConfigureRendererOptions = {
  /**
   * Refine the given search parameters.
   */
  refine: Refine;
};

const withUsage = createDocumentationMessageGenerator({
  name: 'configure',
  connector: true,
});

function getInitialSearchParameters(
  state: SearchParameters,
  widgetParams: ConfigureConnectorParams
): SearchParameters {
  // We leverage the helper internals to remove the `widgetParams` from
  // the state. The function `setQueryParameters` omits the values that
  // are `undefined` on the next state.
  return state.setQueryParameters(
    Object.keys(widgetParams.searchParameters).reduce(
      (acc, key) => ({
        ...acc,
        [key]: undefined,
      }),
      {}
    )
  );
}

export type ConfigureConnector = Connector<
  ConfigureRendererOptions,
  ConfigureConnectorParams
>;

const connectConfigure: ConfigureConnector = function connectConfigure(
  renderFn = noop,
  unmountFn = noop
) {
  return widgetParams => {
    if (!widgetParams || !isPlainObject(widgetParams.searchParameters)) {
      throw new Error(
        withUsage('The `searchParameters` option expects an object.')
      );
    }

    type ConnectorState = {
      refine?: Refine;
    };

    const connectorState: ConnectorState = {};

    function refine(helper: AlgoliaSearchHelper): Refine {
      return (searchParameters: PlainSearchParameters) => {
        // Merge new `searchParameters` with the ones set from other widgets
        const actualState = getInitialSearchParameters(
          helper.state,
          widgetParams
        );
        const nextSearchParameters = mergeSearchParameters(
          actualState,
          new algoliasearchHelper.SearchParameters(searchParameters)
        );

        // Trigger a search with the resolved search parameters
        helper.setState(nextSearchParameters).search();

        // Update original `widgetParams.searchParameters` to the new refined one
        widgetParams.searchParameters = searchParameters;
      };
    }

    return {
      $$type: 'ais.configure',

      init(initOptions) {
        const { renderState, helper, instantSearchInstance } = initOptions;

        connectorState.refine = refine(helper);

        renderFn(
          {
            ...this.getWidgetRenderState!(renderState, initOptions).configure!,
            instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        const { renderState, instantSearchInstance } = renderOptions;

        renderFn(
          {
            ...this.getWidgetRenderState!(renderState, renderOptions)
              .configure!,
            instantSearchInstance,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        return getInitialSearchParameters(state, widgetParams);
      },

      getWidgetRenderState(renderState) {
        return {
          ...renderState,
          configure: {
            refine: connectorState.refine!,
            widgetParams,
          },
        };
      },

      getWidgetSearchParameters(state, { uiState }) {
        return mergeSearchParameters(
          state,
          new algoliasearchHelper.SearchParameters({
            ...uiState.configure,
            ...widgetParams.searchParameters,
          })
        );
      },

      getWidgetUiState(uiState) {
        return {
          ...uiState,
          configure: {
            ...uiState.configure,
            ...widgetParams.searchParameters,
          },
        };
      },
    };
  };
};

export default connectConfigure;
