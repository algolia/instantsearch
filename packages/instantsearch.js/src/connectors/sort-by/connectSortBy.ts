import {
  checkRendering,
  createDocumentationMessageGenerator,
  find,
  warning,
  noop,
} from '../../lib/utils';

import type { Connector, TransformItems, WidgetRenderState } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'sort-by',
  connector: true,
});

/**
 * The **SortBy** connector provides the logic to build a custom widget that will display a
 * list of indices or sorting strategies. With Algolia, this is most commonly used for changing
 * ranking strategy. This allows a user to change how the hits are being sorted.
 *
 * This connector supports two sorting modes:
 * 1. **Index-based (traditional)**: Uses the `value` property to switch between different indices.
 *    This is the standard behavior for non-composition setups.
 *
 * 2. **Strategy-based (composition mode)**: Uses the `strategy` property to apply sorting strategies
 *    via the `sortBy` search parameter. This is only available when using Algolia Compositions.
 *
 * Items can mix both types in the same widget, allowing for flexible sorting options.
 */

export type SortByIndexItem = {
  /**
   * The name of the index to target.
   */
  value: string;
  /**
   * The label of the index to display.
   */
  label: string;
  /**
   * Ensures mutual exclusivity with strategy.
   */
  strategy?: never;
};

export type SortByStrategyItem = {
  /**
   * The name of the sorting strategy to use.
   * Only available in composition mode.
   */
  strategy: string;
  /**
   * The label of the strategy to display.
   */
  label: string;
  /**
   * Ensures mutual exclusivity with value.
   */
  value?: never;
};

export type SortByItem = SortByIndexItem | SortByStrategyItem;

export type SortByConnectorParams = {
  /**
   * Array of objects defining the different indices or strategies to choose from.
   */
  items: SortByItem[];
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<SortByItem>;
};

export type SortByRenderState = {
  /**
   * The initially selected index or strategy.
   */
  initialIndex?: string;
  /**
   * The currently selected index or strategy.
   */
  currentRefinement: string;
  /**
   * All the available indices and strategies
   */
  options: Array<{ value: string; label: string }>;
  /**
   * Switches indices or strategies and triggers a new search.
   */
  refine: (value: string) => void;
  /**
   * `true` if the last search contains no result.
   * @deprecated Use `canRefine` instead.
   */
  hasNoResults: boolean;
  /**
   * `true` if we can refine.
   */
  canRefine: boolean;
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

function isStrategyItem(item: SortByItem): item is SortByStrategyItem {
  return 'strategy' in item && item.strategy !== undefined;
}

function getItemValue(item: SortByItem): string {
  if (isStrategyItem(item)) {
    return item.strategy;
  }
  return item.value;
}

function isValidStrategy(
  itemsMap: Map<string, SortByItem>,
  value: string | undefined
): boolean {
  if (!value) return false;
  const item = itemsMap.get(value);
  return item !== undefined && isStrategyItem(item);
}

const connectSortBy: SortByConnector = function connectSortBy(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  const connectorState: ConnectorState = {};

  type ConnectorState = {
    refine?: (value: string) => void;
    initialValue?: string;
    // Cached flag: whether we're in composition mode (checked once, never changes)
    // This is cached because instantSearchInstance is not available in all lifecycle methods
    isUsingComposition?: boolean;
    // Map for O(1) lookup: value/strategy -> item
    itemsMap?: Map<string, SortByItem>;
  };

  return (widgetParams) => {
    const {
      items,
      transformItems = ((x) => x) as NonNullable<
        SortByConnectorParams['transformItems']
      >,
    } = widgetParams || {};

    if (!Array.isArray(items)) {
      throw new Error(
        withUsage('The `items` option expects an array of objects.')
      );
    }

    const itemsMap = new Map<string, SortByItem>();

    items.forEach((item, index) => {
      const hasValue = 'value' in item && item.value !== undefined;
      const hasStrategy = 'strategy' in item && item.strategy !== undefined;

      // Validate mutual exclusivity
      if (hasValue && hasStrategy) {
        throw new Error(
          withUsage(
            `Item at index ${index} cannot have both "value" and "strategy" properties.`
          )
        );
      }

      if (!hasValue && !hasStrategy) {
        throw new Error(
          withUsage(
            `Item at index ${index} must have either a "value" or "strategy" property.`
          )
        );
      }

      const itemValue = getItemValue(item);

      // Check for cross-type collision (strategy name matching an index value)
      if (itemsMap.has(itemValue)) {
        const existing = itemsMap.get(itemValue)!;
        // Only throw if it's a cross-type collision
        if (isStrategyItem(item) !== isStrategyItem(existing)) {
          throw new Error(
            withUsage(
              `Strategy "${item.strategy}" conflicts with an existing index value. Index values and strategy names must be unique.`
            )
          );
        }
        // Same-type duplicates: silent overwrite (existing behavior)
      }

      itemsMap.set(itemValue, item);
    });

    connectorState.itemsMap = itemsMap;

    return {
      $$type: 'ais.sortBy',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        // Check if strategies are used outside composition mode
        const hasStrategyItems = items.some(
          (item) => 'strategy' in item && item.strategy
        );

        if (hasStrategyItems && !instantSearchInstance.compositionID) {
          throw new Error(
            withUsage(
              'Sorting strategies can only be used in composition mode. Please provide a "compositionID" to your InstantSearch instance.'
            )
          );
        }

        const widgetRenderState = this.getWidgetRenderState(initOptions);
        const currentIndex = widgetRenderState.currentRefinement;
        const isCurrentIndexInItems = find(
          items,
          (item) => getItemValue(item) === currentIndex
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

        // Clear sortBy parameter if it was set
        if (connectorState.isUsingComposition && state.sortBy) {
          state = state.setQueryParameter('sortBy' as any, undefined);
        }

        // Restore initial index if changed
        if (
          connectorState.initialValue &&
          state.index !== connectorState.initialValue
        ) {
          return state.setIndex(connectorState.initialValue);
        }

        return state;
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          sortBy: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({
        results,
        helper,
        state,
        parent,
        instantSearchInstance,
      }) {
        // Capture initial value (composition ID or main index)
        if (!connectorState.initialValue && parent) {
          connectorState.initialValue = parent.getIndexName();
        }

        // Create refine function if not exists
        if (!connectorState.refine) {
          // Cache composition mode status for lifecycle methods that don't have access to instantSearchInstance
          connectorState.isUsingComposition = Boolean(
            instantSearchInstance?.compositionID
          );

          connectorState.refine = (value: string) => {
            // O(1) lookup using the items map
            const item = connectorState.itemsMap!.get(value);

            if (item && isStrategyItem(item)) {
              // Strategy-based: set sortBy parameter for composition API
              // The composition backend will interpret this and apply the sorting strategy
              helper.setQueryParameter('sortBy', item.strategy).search();
            } else {
              // Index-based: clear any existing sortBy parameter and switch to the new index
              // Clearing sortBy is critical when transitioning from strategy to index-based sorting
              helper
                .setQueryParameter('sortBy', undefined)
                .setIndex(value)
                .search();
            }
          };
        }

        // Transform items first (on original structure)
        const transformedItems = transformItems(items, { results });

        // Normalize items: all get a 'value' property for the render state
        const normalizedItems = transformedItems.map((item) => ({
          label: item.label,
          value: getItemValue(item),
        }));

        // Determine current refinement
        // In composition mode, prefer sortBy parameter if it corresponds to a valid strategy item
        // Otherwise use the index (for index-based items or when no valid strategy is active)
        const currentRefinement =
          connectorState.isUsingComposition &&
          isValidStrategy(connectorState.itemsMap!, state.sortBy)
            ? state.sortBy!
            : state.index;

        const hasNoResults = results ? results.nbHits === 0 : true;

        return {
          currentRefinement,
          options: normalizedItems,
          refine: connectorState.refine,
          hasNoResults,
          canRefine: !hasNoResults && items.length > 0,
          widgetParams,
        };
      },

      getWidgetUiState(uiState, { searchParameters }) {
        // In composition mode with an active strategy, use sortBy parameter
        // Otherwise use index-based behavior (traditional mode)
        const currentValue =
          connectorState.isUsingComposition &&
          isValidStrategy(connectorState.itemsMap!, searchParameters.sortBy)
            ? searchParameters.sortBy!
            : searchParameters.index;

        return {
          ...uiState,
          sortBy:
            currentValue !== connectorState.initialValue
              ? currentValue
              : undefined,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const sortByValue =
          uiState.sortBy ||
          connectorState.initialValue ||
          searchParameters.index;

        if (isValidStrategy(connectorState.itemsMap!, sortByValue)) {
          const item = connectorState.itemsMap!.get(sortByValue)!;
          // Strategy-based: set the sortBy parameter for composition API
          // The index remains as the compositionID
          return searchParameters.setQueryParameter('sortBy', item.strategy);
        }

        // Index-based: set the index parameter (traditional behavior)
        return searchParameters.setQueryParameter('index', sortByValue);
      },
    };
  };
};

export default connectSortBy;
