import {
  checkRendering,
  warning,
  createDocumentationMessageGenerator,
  createSendEventForFacet,
  isEqual,
  noop,
  SendEventForFacet,
} from '../../lib/utils';
import { SearchResults } from 'algoliasearch-helper';
import {
  Connector,
  CreateURL,
  TransformItems,
  RenderOptions,
  Widget,
  SortBy,
  WidgetRenderState,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'hierarchical-menu',
  connector: true,
});

export type HierarchicalMenuItem = {
  /**
   * Value of the menu item.
   */
  value: string;
  /**
   * Human-readable value of the menu item.
   */
  label: string;
  /**
   * Number of matched results after refinement is applied.
   */
  count: number;
  /**
   * Indicates if the refinement is applied.
   */
  isRefined: boolean;
  /**
   * n+1 level of items, same structure HierarchicalMenuItem
   */
  data: HierarchicalMenuItem[] | null;
};

export type HierarchicalMenuConnectorParams = {
  /**
   *  Attributes to use to generate the hierarchy of the menu.
   */
  attributes: string[];
  /**
   * Separator used in the attributes to separate level values.
   */
  separator?: string;
  /**
   * Prefix path to use if the first level is not the root level.
   */
  rootPath?: string | null;
  /**
   * Show the siblings of the selected parent levels of the current refined value. This
   * does not impact the root level.
   */
  showParentLevel?: boolean;
  /**
   * Max number of values to display.
   */
  limit?: number;
  /**
   * Whether to display the "show more" button.
   */
  showMore?: boolean;
  /**
   * Max number of values to display when showing more.
   */
  showMoreLimit?: number;
  /**
   * How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
   * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
   */
  sortBy?: SortBy<HierarchicalMenuItem>;
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<HierarchicalMenuItem>;
};

export type HierarchicalMenuRenderState = {
  /**
   * Creates an url for the next state for a clicked item.
   */
  createURL: CreateURL<string>;
  /**
   * Values to be rendered.
   */
  items: HierarchicalMenuItem[];
  /**
   * Sets the path of the hierarchical filter and triggers a new search.
   */
  refine: (value: string) => void;
  /**
   *  Indicates if search state can be refined.
   */
  canRefine: boolean;
  /**
   * True if the menu is displaying all the menu items.
   */
  isShowingMore: boolean;
  /**
   * Toggles the number of values displayed between `limit` and `showMoreLimit`.
   */
  toggleShowMore: () => void;
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

export type HierarchicalMenuWidgetDescription = {
  $$type: 'ais.hierarchicalMenu';
  renderState: HierarchicalMenuRenderState;
  indexRenderState: {
    hierarchicalMenu: {
      [rootAttribute: string]: WidgetRenderState<
        HierarchicalMenuRenderState,
        HierarchicalMenuConnectorParams
      >;
    };
  };
  indexUiState: {
    hierarchicalMenu: {
      [rootAttribute: string]: string[];
    };
  };
};

export type HierarchicalMenuConnector = Connector<
  HierarchicalMenuWidgetDescription,
  HierarchicalMenuConnectorParams
>;

/**
 * **HierarchicalMenu** connector provides the logic to build a custom widget
 * that will give the user the ability to explore facets in a tree-like structure.
 *
 * This is commonly used for multi-level categorization of products on e-commerce
 * websites. From a UX point of view, we suggest not displaying more than two
 * levels deep.
 *
 * @type {Connector}
 * @param {function(HierarchicalMenuRenderingOptions, boolean)} renderFn Rendering function for the custom **HierarchicalMenu** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomHierarchicalMenuWidgetParams)} Re-usable widget factory for a custom **HierarchicalMenu** widget.
 */
const connectHierarchicalMenu: HierarchicalMenuConnector = function connectHierarchicalMenu(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const {
      attributes,
      separator = ' > ',
      rootPath = null,
      showParentLevel = true,
      limit = 10,
      showMore = false,
      showMoreLimit = 20,
      sortBy = ['name:asc'],
      transformItems = (items => items) as TransformItems<HierarchicalMenuItem>,
    } = widgetParams || {};

    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      throw new Error(
        withUsage('The `attributes` option expects an array of strings.')
      );
    }

    if (showMore === true && showMoreLimit <= limit) {
      throw new Error(
        withUsage('The `showMoreLimit` option must be greater than `limit`.')
      );
    }

    type ThisWidget = Widget<
      HierarchicalMenuWidgetDescription & { widgetParams: typeof widgetParams }
    >;

    // we need to provide a hierarchicalFacet name for the search state
    // so that we can always map $hierarchicalFacetName => real attributes
    // we use the first attribute name
    const [hierarchicalFacetName] = attributes;
    let sendEvent: HierarchicalMenuRenderState['sendEvent'];

    // Provide the same function to the `renderFn` so that way the user
    // has to only bind it once when `isFirstRendering` for instance
    let toggleShowMore = () => {};
    function cachedToggleShowMore() {
      toggleShowMore();
    }

    let _refine: HierarchicalMenuRenderState['refine'] | undefined;

    let isShowingMore = false;

    function createToggleShowMore(
      renderOptions: RenderOptions,
      widget: ThisWidget
    ) {
      return () => {
        isShowingMore = !isShowingMore;
        widget.render!(renderOptions);
      };
    }

    function getLimit() {
      return isShowingMore ? showMoreLimit : limit;
    }

    function _prepareFacetValues(
      facetValues: SearchResults.HierarchicalFacet[]
    ): HierarchicalMenuItem[] {
      return facetValues
        .slice(0, getLimit())
        .map(({ name: label, path: value, data, ...subValue }) => {
          const item: HierarchicalMenuItem = {
            ...subValue,
            label,
            value,
            data: null,
          };
          if (Array.isArray(data)) {
            item.data = _prepareFacetValues(data);
          }
          return item;
        });
    }

    return {
      $$type: 'ais.hierarchicalMenu',

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

        toggleShowMore = createToggleShowMore(renderOptions, this);

        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance,
          },
          false
        );
      },

      /**
       * @param {Object} param0 cleanup arguments
       * @param {any} param0.state current search parameters
       * @returns {any} next search parameters
       */
      dispose({ state }) {
        unmountFn();

        return state
          .removeHierarchicalFacet(hierarchicalFacetName)
          .setQueryParameter('maxValuesPerFacet', undefined);
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          hierarchicalMenu: {
            ...renderState.hierarchicalMenu,
            [hierarchicalFacetName]: this.getWidgetRenderState(renderOptions),
          },
        };
      },

      getWidgetRenderState({
        results,
        state,
        createURL,
        instantSearchInstance,
        helper,
      }) {
        let items: HierarchicalMenuRenderState['items'] = [];
        let canToggleShowMore = false;

        // Bind createURL to this specific attribute
        function _createURL(facetValue: string) {
          return createURL(
            state
              .resetPage()
              .toggleFacetRefinement(hierarchicalFacetName, facetValue)
          );
        }

        if (!sendEvent) {
          sendEvent = createSendEventForFacet({
            instantSearchInstance,
            helper,
            attribute: hierarchicalFacetName,
            widgetType: this.$$type!,
          });
        }

        if (!_refine) {
          _refine = function(facetValue) {
            sendEvent('click', facetValue);
            helper
              .toggleFacetRefinement(hierarchicalFacetName, facetValue)
              .search();
          };
        }

        if (results) {
          const facetValues = results.getFacetValues(hierarchicalFacetName, {
            sortBy,
          });
          const facetItems =
            facetValues && !Array.isArray(facetValues) && facetValues.data
              ? facetValues.data
              : [];

          // If the limit is the max number of facet retrieved it is impossible to know
          // if the facets are exhaustive. The only moment we are sure it is exhaustive
          // is when it is strictly under the number requested unless we know that another
          // widget has requested more values (maxValuesPerFacet > getLimit()).
          // Because this is used for making the search of facets unable or not, it is important
          // to be conservative here.
          const hasExhaustiveItems =
            (state.maxValuesPerFacet || 0) > getLimit()
              ? facetItems.length <= getLimit()
              : facetItems.length < getLimit();

          canToggleShowMore =
            showMore && (isShowingMore || !hasExhaustiveItems);

          items = transformItems(_prepareFacetValues(facetItems));
        }

        return {
          items,
          refine: _refine,
          canRefine: items.length > 0,
          createURL: _createURL,
          sendEvent,
          widgetParams,
          isShowingMore,
          toggleShowMore: cachedToggleShowMore,
          canToggleShowMore,
        };
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const path = searchParameters.getHierarchicalFacetBreadcrumb(
          hierarchicalFacetName
        );

        if (!path.length) {
          return uiState;
        }

        return {
          ...uiState,
          hierarchicalMenu: {
            ...uiState.hierarchicalMenu,
            [hierarchicalFacetName]: path,
          },
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const values =
          uiState.hierarchicalMenu &&
          uiState.hierarchicalMenu[hierarchicalFacetName];

        if (searchParameters.isHierarchicalFacet(hierarchicalFacetName)) {
          const facet = searchParameters.getHierarchicalFacetByName(
            hierarchicalFacetName
          );

          warning(
            isEqual(facet.attributes, attributes) &&
              facet.separator === separator &&
              facet.rootPath === rootPath,
            'Using Breadcrumb and HierarchicalMenu on the same facet with different options overrides the configuration of the HierarchicalMenu.'
          );
        }

        const withFacetConfiguration = searchParameters
          .removeHierarchicalFacet(hierarchicalFacetName)
          .addHierarchicalFacet({
            name: hierarchicalFacetName,
            attributes,
            separator,
            rootPath,
            // @ts-ignore `showParentLevel` is missing in the SearchParameters.HierarchicalFacet declaration
            showParentLevel,
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

        if (!values) {
          return withMaxValuesPerFacet.setQueryParameters({
            hierarchicalFacetsRefinements: {
              ...withMaxValuesPerFacet.hierarchicalFacetsRefinements,
              [hierarchicalFacetName]: [],
            },
          });
        }

        return withMaxValuesPerFacet.addHierarchicalFacetRefinement(
          hierarchicalFacetName,
          values.join(separator)
        );
      },
    };
  };
};

export default connectHierarchicalMenu;
