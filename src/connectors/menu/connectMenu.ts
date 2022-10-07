import type { AlgoliaSearchHelper, SearchResults } from 'algoliasearch-helper';
import type { SendEventForFacet } from '../../lib/utils';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  createSendEventForFacet,
  TAG_PLACEHOLDER,
  TAG_REPLACEMENT,
  escapeFacets,
  noop,
} from '../../lib/utils';
import type {
  Connector,
  CreateURL,
  InitOptions,
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

const DEFAULT_SORT = ['isRefined', 'name:asc'];

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
   * Human-readable value of the searched menu item.
   */
  highlighted?: string;
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
   *
   * If a facetOrdering is set in the index settings, it is used when sortBy isn't passed
   */
  sortBy?: SortBy<SearchResults.HierarchicalFacet>;
  /**
   * Escapes the content of the facet values.
   */
  escapeFacetValues?: boolean;
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
   * Indicates whether the results are exhaustive or not.
   */
  hasExhaustiveItems: boolean;
  /**
   * Creates the URL for a single item name in the list.
   */
  createURL: CreateURL<string>;
  /**
   * Filter the search to item value.
   */
  refine(value: string): void;
  /**
   * True if refinement can be applied.
   */
  canRefine: boolean;
  /**
   * Searches for values inside the list.
   */
  searchForItems(query: string): void;
  /**
   * Whether the values are from an index search or not.
   */
  isFromSearch: boolean;
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
 * **Requirement:** the attribute passed as `attribute` must be present in "attributes for faceting" on the Algolia dashboard or configured as attributesForFaceting via a set settings call to the Algolia API.
 *
 *  This connector provides:
 * - a `refine()` function to select an item. Selecting a new element also unselects the one that is currently selected.
 * - a `toggleShowMore()` function to display more or less items.
 * - a `searchForItems()` function to search within the items.
 */
const connectMenu: MenuConnector = function connectMenu(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    const {
      attribute,
      limit = 10,
      showMore = false,
      showMoreLimit = 20,
      sortBy = DEFAULT_SORT,
      escapeFacetValues = true,
      transformItems = ((items) => items) as NonNullable<
        MenuConnectorParams['transformItems']
      >,
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

    let searchForFacetValues: (
      renderOptions: RenderOptions | InitOptions
    ) => MenuRenderState['searchForItems'] = () => () => {};

    const formatItems = ({
      name: label,
      escapedValue: value,
      path,
      ...item
    }: SearchResults.HierarchicalFacet): MenuItem => ({
      ...item,
      value,
      label,
      highlighted: label,
    });

    let lastResultsFromMainSearch: SearchResults;
    let lastItemsFromMainSearch: MenuItem[] = [];
    let hasExhaustiveItems = true;

    function createSearchForFacetValues(
      helper: AlgoliaSearchHelper,
      widget: ThisWidget
    ) {
      return (renderOptions: RenderOptions | InitOptions) => (query: string) => {
        const { instantSearchInstance, results: searchResults } = renderOptions;
        if (query === '' && lastItemsFromMainSearch) {
          // render with previous data from the helper.
          renderFn(
            {
              ...widget.getWidgetRenderState({
                ...renderOptions,
                results: lastResultsFromMainSearch,
              }),
              instantSearchInstance,
            },
            false
          );
        } else {
          const tags = {
            highlightPreTag: escapeFacetValues
              ? TAG_PLACEHOLDER.highlightPreTag
              : TAG_REPLACEMENT.highlightPreTag,
            highlightPostTag: escapeFacetValues
              ? TAG_PLACEHOLDER.highlightPostTag
              : TAG_REPLACEMENT.highlightPostTag,
          };

          helper
            .searchForFacetValues(
              attribute,
              query,
              // We cap the `maxFacetHits` value to 100 because the Algolia API
              // doesn't support a greater number.
              // See https://www.algolia.com/doc/api-reference/api-parameters/maxFacetHits/
              Math.min(getLimit(), 100),
              tags,
              true
            )
            .then((results) => {
              const facetValues = escapeFacetValues
                ? escapeFacets(results.facetHits)
                : results.facetHits;

              const normalizedFacetValues = transformItems(
                facetValues.map(({ escapedValue, value, ...item }) => ({
                  ...item,
                  value: escapedValue,
                  label: value,
                })),
                { results: searchResults }
              );

              renderFn(
                {
                  ...widget.getWidgetRenderState({
                    ...renderOptions,
                    results: lastResultsFromMainSearch,
                  }),
                  items: normalizedFacetValues,
                  canToggleShowMore: false,
                  canRefine: true,
                  isFromSearch: true,
                  instantSearchInstance,
                },
                false
              );
            });
        }
      };
    };

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
        const { results, state, createURL, instantSearchInstance, helper } =
          renderOptions;
        let items: MenuItem[] = [];
        let facetValues: SearchResults.HierarchicalFacet[] = [];

        if (!sendEvent || !_refine || !searchForFacetValues) {
          sendEvent = createSendEventForFacet({
            instantSearchInstance,
            helper,
            attribute,
            widgetType: this.$$type,
          });

          _refine = (facetValue) => {
            const [refinedItem] =
              helper.getHierarchicalFacetBreadcrumb(attribute);
            sendEvent!('click', facetValue ? facetValue : refinedItem);
            helper
              .toggleFacetRefinement(
                attribute,
                facetValue ? facetValue : refinedItem
              )
              .search();
          };

          searchForFacetValues = createSearchForFacetValues(helper, this);
        }

        if (results) {
          const values = results.getFacetValues(attribute, {
            sortBy,
            facetOrdering: sortBy === DEFAULT_SORT,
          });
          facetValues =
            values && !Array.isArray(values) && values.data ? values.data : [];
          items = transformItems(
            facetValues.slice(0, getLimit()).map(formatItems),
            { results }
          );

          const maxValuesPerFacetConfig = state.maxValuesPerFacet;
          const currentLimit = getLimit();
          // If the limit is the max number of facet retrieved it is impossible to know
          // if the facets are exhaustive. The only moment we are sure it is exhaustive
          // is when it is strictly under the number requested unless we know that another
          // widget has requested more values (maxValuesPerFacet > getLimit()).
          // Because this is used for making the search of facets unable or not, it is important
          // to be conservative here.
          hasExhaustiveItems =
            maxValuesPerFacetConfig! > currentLimit
              ? facetValues.length <= currentLimit
              : facetValues.length < currentLimit;

          lastResultsFromMainSearch = results;
          lastItemsFromMainSearch = items;

          if (renderOptions.results) {
            toggleShowMore = createToggleShowMore(renderOptions, this);
          }
        }

        // Do not mistake searchForFacetValues and searchFacetValues which is the actual search
        // function
        const searchFacetValues =
          searchForFacetValues && searchForFacetValues(renderOptions);

        const canShowLess =
          isShowingMore && lastItemsFromMainSearch.length > limit;
        const canShowMore = showMore && !hasExhaustiveItems;

        const canToggleShowMore = canShowLess || canShowMore;

        return {
          items,
          createURL: (facetValue) =>
            createURL(
              state.resetPage().toggleFacetRefinement(attribute, facetValue)
            ),
          refine: _refine,
          sendEvent,
          searchForItems: searchFacetValues,
          isFromSearch: false,
          canRefine: items.length > 0,
          widgetParams,
          isShowingMore,
          toggleShowMore: cachedToggleShowMore,
          canToggleShowMore,
          hasExhaustiveItems,
        };
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const [value] =
          searchParameters.getHierarchicalFacetBreadcrumb(attribute);

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
