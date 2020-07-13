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
  refineLater: Refine;
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
      refineLater?: Refine;
    };

    const connectorState: ConnectorState = {};

    function refine({
      helper,
      triggerSearch,
    }: {
      helper: AlgoliaSearchHelper;
      triggerSearch: boolean;
    }): Refine {
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

        // Set the resolved search parameters
        helper.setState(nextSearchParameters);
        if (triggerSearch) {
          helper.search();
        }

        // Update original `widgetParams.searchParameters` to the new refined one
        widgetParams.searchParameters = searchParameters;
      };
    }

    return {
      $$type: 'ais.configure',

      init({ instantSearchInstance, helper }) {
        connectorState.refine = refine({ helper, triggerSearch: true });
        connectorState.refineLater = refine({
          helper,
          triggerSearch: false,
        });

        renderFn(
          {
            refine: connectorState.refine,
            refineLater: connectorState.refineLater,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ instantSearchInstance }) {
        renderFn(
          {
            refine: connectorState.refine!,
            refineLater: connectorState.refineLater!,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        return getInitialSearchParameters(state, widgetParams);
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

      getWidgetState(uiState) {
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
