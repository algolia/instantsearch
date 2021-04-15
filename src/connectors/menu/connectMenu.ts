import {
  checkRendering,
  createDocumentationMessageGenerator,
  createSendEventForFacet,
  noop,
  SendEventForFacet,
} from '../../lib/utils';
import {
  Connector,
  RenderOptions,
  SortBy,
  TransformItems,
  Widget,
  WidgetRenderState,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'menu',
  connector: true,
});

export type MenuItem = {
  /**
   * The value of the menu item.
   */
  value: string;
  /**
   * Human-readable value of the menu item.
   */
  label: string;
  /**
   * Number of results matched after refinement is applied.
   */
  count: number;
  /**
   * Indicates if the refinement is applied.
   */
  isRefined: boolean;
};

export type MenuConnectorParams = {
  /**
   * Name of the attribute for faceting (eg. "free_shipping").
   */
  attribute: string;
  /**
   * How many facets values to retrieve.
   */
  limit?: number;
  /**
   * Whether to display a button that expands the number of items.
   */
  showMore?: boolean;
  /**
   * How many facets values to retrieve when `toggleShowMore` is called, this value is meant to be greater than `limit` option.
   */
  showMoreLimit?: number;
  /**
   * How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
   *
   * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
   */
  sortBy?: SortBy<MenuItem>;
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<MenuItem>;
};

export type MenuRenderState = {
  /**
   * The elements that can be refined for the current search results.
   */
  items: MenuItem[];
  /**
   * Creates the URL for a single item name in the list.
   */
  createURL(value: string): string;
  /**
   * Filter the search to item value.
   */
  refine(value: string): void;
  /**
   * True if refinement can be applied.
   */
  canRefine: boolean;
  /**
   * True if the menu is displaying all the menu items.
   */
  isShowingMore: boolean;
  /**
   * Toggles the number of values displayed between `limit` and `showMore.limit`.
   */
  toggleShowMore(): void;
  /**
   * `true` if the toggleShowMore button can be activated (enough items to display more or
   * already displaying more than `limit` items)
   */
  canToggleShowMore: boolean;
  /**
   * Send event to insights middleware
   */
  sendEvent: SendEventForFacet;
};

export type MenuWidgetDescription = {
  $$type: 'ais.menu';
  renderState: MenuRenderState;
  indexRenderState: {
    menu: {
      [attribute: string]: WidgetRenderState<
        MenuRenderState,
        MenuConnectorParams
      >;
    };
  };
  indexUiState: {
    menu: {
      [attribute: string]: string;
    };
  };
};

export type MenuConnector = Connector<
  MenuWidgetDescription,
  MenuConnectorParams
>;

/**
 * **Menu** connector provides the logic to build a widget that will give the user the ability to choose a single value for a specific facet. The typical usage of menu is for navigation in categories.
 *
 * This connector provides a `toggleShowMore()` function to display more or less items and a `refine()`
 * function to select an item. While selecting a new element, the `refine` will also unselect the
 * one that is currently selected.
 *
 * **Requirement:** the attribute passed as `attribute` must be present in "attributes for faceting" on the Algolia dashboard or configured as attributesForFaceting via a set settings call to the Algolia API.
 */
const connectMenu: MenuConnector = function connectMenu(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const {
      attribute,
      limit = 10,
      showMore = false,
      showMoreLimit = 20,
      sortBy = ['isRefined', 'name:asc'],
      transformItems = (items => items) as TransformItems<MenuItem>,
    } = widgetParams || {};

    if (!attribute) {
      throw new Error(withUsage('The `attribute` option is required.'));
    }

    if (showMore === true && showMoreLimit <= limit) {
      throw new Error(
        withUsage('The `showMoreLimit` option must be greater than `limit`.')
      );
    }

    type ThisWidget = Widget<
      MenuWidgetDescription & { widgetParams: typeof widgetParams }
    >;

    let sendEvent: MenuRenderState['sendEvent'] | undefined;
    let _createURL: MenuRenderState['createURL'] | undefined;
    let _refine: MenuRenderState['refine'] | undefined;

    // Provide the same function to the `renderFn` so that way the user
    // has to only bind it once when `isFirstRendering` for instance
    let isShowingMore = false;
    let toggleShowMore = () => {};
    function createToggleShowMore(
      renderOptions: RenderOptions,
      widget: ThisWidget
    ) {
      return () => {
        isShowingMore = !isShowingMore;
        widget.render!(renderOptions);
      };
    }
    function cachedToggleShowMore() {
      toggleShowMore();
    }

    function getLimit() {
      return isShowingMore ? showMoreLimit : limit;
    }

    return {
      $$type: 'ais.menu' as const,

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

        return state
          .removeHierarchicalFacet(attribute)
          .setQueryParameter('maxValuesPerFacet', undefined);
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          menu: {
            ...renderState.menu,
            [attribute]: this.getWidgetRenderState(renderOptions),
          },
        };
      },

      getWidgetRenderState(renderOptions) {
        const {
          results,
          createURL,
          instantSearchInstance,
          helper,
        } = renderOptions;

        let items: MenuRenderState['items'] = [];
        let canToggleShowMore = false;

        if (!sendEvent) {
          sendEvent = createSendEventForFacet({
            instantSearchInstance,
            helper,
            attribute,
            widgetType: this.$$type!,
          });
        }

        if (!_createURL) {
          _createURL = (facetValue: string) =>
            createURL(
              helper.state
                .resetPage()
                .toggleFacetRefinement(attribute, facetValue)
            );
        }

        if (!_refine) {
          _refine = function(facetValue: string) {
            const [refinedItem] = helper.getHierarchicalFacetBreadcrumb(
              attribute
            );
            sendEvent!('click', facetValue ? facetValue : refinedItem);
            helper
              .toggleFacetRefinement(
                attribute,
                facetValue ? facetValue : refinedItem
              )
              .search();
          };
        }

        if (renderOptions.results) {
          toggleShowMore = createToggleShowMore(renderOptions, this);
        }

        if (results) {
          const facetValues = results.getFacetValues(attribute, {
            sortBy,
          });
          const facetItems =
            facetValues && !Array.isArray(facetValues) && facetValues.data
              ? facetValues.data
              : [];

          canToggleShowMore =
            showMore && (isShowingMore || facetItems.length > getLimit());

          items = transformItems(
            facetItems
              .slice(0, getLimit())
              .map(({ name: label, path: value, ...item }) => ({
                ...item,
                label,
                value,
              }))
          );
        }

        return {
          items,
          createURL: _createURL,
          refine: _refine,
          sendEvent,
          canRefine: items.length > 0,
          widgetParams,
          isShowingMore,
          toggleShowMore: cachedToggleShowMore,
          canToggleShowMore,
        };
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const [value] = searchParameters.getHierarchicalFacetBreadcrumb(
          attribute
        );

        if (!value) {
          return uiState;
        }

        return {
          ...uiState,
          menu: {
            ...uiState.menu,
            [attribute]: value,
          },
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const value = uiState.menu && uiState.menu[attribute];

        const withFacetConfiguration = searchParameters
          .removeHierarchicalFacet(attribute)
          .addHierarchicalFacet({
            name: attribute,
            attributes: [attribute],
          });

        const currentMaxValuesPerFacet =
          withFacetConfiguration.maxValuesPerFacet || 0;

        const nextMaxValuesPerFacet = Math.max(
          currentMaxValuesPerFacet,
          showMore ? showMoreLimit : limit
        );

        const withMaxValuesPerFacet = withFacetConfiguration.setQueryParameter(
          'maxValuesPerFacet',
          nextMaxValuesPerFacet
        );

        if (!value) {
          return withMaxValuesPerFacet.setQueryParameters({
            hierarchicalFacetsRefinements: {
              ...withMaxValuesPerFacet.hierarchicalFacetsRefinements,
              [attribute]: [],
            },
          });
        }

        return withMaxValuesPerFacet.addHierarchicalFacetRefinement(
          attribute,
          value
        );
      },
    };
  };
};

export default connectMenu;
