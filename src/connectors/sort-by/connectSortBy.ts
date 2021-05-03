import {
  checkRendering,
  createDocumentationMessageGenerator,
  find,
  warning,
  noop,
} from '../../lib/utils';
import { Connector, TransformItems, WidgetRenderState } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'sort-by',
  connector: true,
});

/**
 * The **SortBy** connector provides the logic to build a custom widget that will display a
 * list of indices. With Algolia, this is most commonly used for changing ranking strategy. This allows
 * a user to change how the hits are being sorted.
 */

export type SortByItem = {
  /**
   * The name of the index to target.
   */
  value: string;
  /**
   * The label of the index to display.
   */
  label: string;
};

export type SortByConnectorParams = {
  /**
   * Array of objects defining the different indices to choose from.
   */
  items: SortByItem[];
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<SortByItem>;
};

export type SortByRenderState = {
  /**
   * The initially selected index.
   */
  initialIndex?: string;
  /**
   * The currently selected index.
   */
  currentRefinement: string;
  /**
   * All the available indices
   */
  options: SortByItem[];
  /**
   * Switches indices and triggers a new search.
   */
  refine: (value: string) => void;
  /**
   * `true` if the last search contains no result.
   */
  hasNoResults: boolean;
};

export type SortByWidgetDescription = {
  $$type: 'ais.sortBy';
  renderState: SortByRenderState;
  indexRenderState: {
    sortBy: WidgetRenderState<SortByRenderState, SortByConnectorParams>;
  };
  indexUiState: {
    sortBy: string;
  };
};

export type SortByConnector = Connector<
  SortByWidgetDescription,
  SortByConnectorParams
>;

const connectSortBy: SortByConnector = function connectSortBy(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  const connectorState: ConnectorState = {};

  type ConnectorState = {
    setIndex?(indexName: string): void;
    initialIndex?: string;
  };

  return widgetParams => {
    const { items, transformItems = (x => x) as TransformItems<SortByItem> } =
      widgetParams || {};

    if (!Array.isArray(items)) {
      throw new Error(
        withUsage('The `items` option expects an array of objects.')
      );
    }

    return {
      $$type: 'ais.sortBy',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        const widgetRenderState = this.getWidgetRenderState(initOptions);
        const currentIndex = widgetRenderState.currentRefinement;
        const isCurrentIndexInItems = find(
          items,
          item => item.value === currentIndex
        );

        warning(
          isCurrentIndexInItems !== undefined,
          `The index named "${currentIndex}" is not listed in the \`items\` of \`sortBy\`.`
        );

        renderFn(
          {
            ...widgetRenderState,
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

        return connectorState.initialIndex
          ? state.setIndex(connectorState.initialIndex)
          : state;
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          sortBy: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ results, helper, parent }) {
        if (!connectorState.initialIndex && parent) {
          connectorState.initialIndex = parent.getIndexName();
        }
        if (!connectorState.setIndex) {
          connectorState.setIndex = indexName => {
            helper.setIndex(indexName).search();
          };
        }

        return {
          currentRefinement: helper.state.index,
          options: transformItems(items),
          refine: connectorState.setIndex,
          hasNoResults: results ? results.nbHits === 0 : true,
          widgetParams,
        };
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const currentIndex = searchParameters.index;

        if (currentIndex === connectorState.initialIndex) {
          return uiState;
        }

        return {
          ...uiState,
          sortBy: currentIndex,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        return searchParameters.setQueryParameter(
          'index',
          uiState.sortBy ||
            connectorState.initialIndex ||
            searchParameters.index
        );
      },
    };
  };
};

export default connectSortBy;
