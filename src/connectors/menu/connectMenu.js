import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'menu',
  connector: true,
});

/**
 * @typedef {Object} MenuItem
 * @property {string} value The value of the menu item.
 * @property {string} label Human-readable value of the menu item.
 * @property {number} count Number of results matched after refinement is applied.
 * @property {boolean} isRefined Indicates if the refinement is applied.
 */

/**
 * @typedef {Object} CustomMenuWidgetOptions
 * @property {string} attribute Name of the attribute for faceting (eg. "free_shipping").
 * @property {number} [limit = 10] How many facets values to retrieve.
 * @property {boolean} [showMore = false] Whether to display a button that expands the number of items.
 * @property {number} [showMoreLimit = 20] How many facets values to retrieve when `toggleShowMore` is called, this value is meant to be greater than `limit` option.
 * @property {string[]|function} [sortBy = ['isRefined', 'name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * @typedef {Object} MenuRenderingOptions
 * @property {MenuItem[]} items The elements that can be refined for the current search results.
 * @property {function(item.value): string} createURL Creates the URL for a single item name in the list.
 * @property {function(item.value)} refine Filter the search to item value.
 * @property {boolean} canRefine True if refinement can be applied.
 * @property {Object} widgetParams All original `CustomMenuWidgetOptions` forwarded to the `renderFn`.
 * @property {boolean} isShowingMore True if the menu is displaying all the menu items.
 * @property {function} toggleShowMore Toggles the number of values displayed between `limit` and `showMore.limit`.
 * @property {boolean} canToggleShowMore `true` if the toggleShowMore button can be activated (enough items to display more or
 * already displaying more than `limit` items)
 */

/**
 * **Menu** connector provides the logic to build a widget that will give the user the ability to choose a single value for a specific facet. The typical usage of menu is for navigation in categories.
 *
 * This connector provides a `toggleShowMore()` function to display more or less items and a `refine()`
 * function to select an item. While selecting a new element, the `refine` will also unselect the
 * one that is currently selected.
 *
 * **Requirement:** the attribute passed as `attribute` must be present in "attributes for faceting" on the Algolia dashboard or configured as attributesForFaceting via a set settings call to the Algolia API.
 * @type {Connector}
 * @param {function(MenuRenderingOptions, boolean)} renderFn Rendering function for the custom **Menu** widget. widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomMenuWidgetOptions)} Re-usable widget factory for a custom **Menu** widget.
 * @example
 * // custom `renderFn` to render the custom Menu widget
 * function renderFn(MenuRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     MenuRenderingOptions.widgetParams.containerNode
 *       .html('<select></select');
 *
 *     MenuRenderingOptions.widgetParams.containerNode
 *       .find('select')
 *       .on('change', function(event) {
 *         MenuRenderingOptions.refine(event.target.value);
 *       });
 *   }
 *
 *   var options = MenuRenderingOptions.items.map(function(item) {
 *     return item.isRefined
 *       ? '<option value="' + item.value + '" selected>' + item.label + '</option>'
 *       : '<option value="' + item.value + '">' + item.label + '</option>';
 *   });
 *
 *   MenuRenderingOptions.widgetParams.containerNode
 *     .find('select')
 *     .html(options);
 * }
 *
 * // connect `renderFn` to Menu logic
 * var customMenu = instantsearch.connectors.connectMenu(renderFn);
 *
 * // mount widget on the page
 * search.addWidgets([
 *   customMenu({
 *     containerNode: $('#custom-menu-container'),
 *     attribute: 'categories',
 *     limit: 10,
 *   })
 * ]);
 */
export default function connectMenu(renderFn, unmountFn = noop) {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const {
      attribute,
      limit = 10,
      showMore = false,
      showMoreLimit = 20,
      sortBy = ['isRefined', 'name:asc'],
      transformItems = items => items,
    } = widgetParams;

    if (!attribute) {
      throw new Error(withUsage('The `attribute` option is required.'));
    }

    if (showMore === true && showMoreLimit <= limit) {
      throw new Error(
        withUsage('The `showMoreLimit` option must be greater than `limit`.')
      );
    }

    return {
      $$type: 'ais.menu',

      isShowingMore: false,

      // Provide the same function to the `renderFn` so that way the user
      // has to only bind it once when `isFirstRendering` for instance
      toggleShowMore() {},
      cachedToggleShowMore() {
        this.toggleShowMore();
      },

      createToggleShowMore({ results, instantSearchInstance }) {
        return () => {
          this.isShowingMore = !this.isShowingMore;
          this.render({ results, instantSearchInstance });
        };
      },

      getLimit() {
        return this.isShowingMore ? showMoreLimit : limit;
      },

      refine(helper) {
        return facetValue => {
          const [refinedItem] = helper.getHierarchicalFacetBreadcrumb(
            attribute
          );
          helper
            .toggleRefinement(attribute, facetValue ? facetValue : refinedItem)
            .search();
        };
      },

      init({ helper, createURL, instantSearchInstance }) {
        this.cachedToggleShowMore = this.cachedToggleShowMore.bind(this);

        this._createURL = facetValue =>
          createURL(helper.state.toggleRefinement(attribute, facetValue));

        this._refine = this.refine(helper);

        renderFn(
          {
            items: [],
            createURL: this._createURL,
            refine: this._refine,
            instantSearchInstance,
            canRefine: false,
            widgetParams,
            isShowingMore: this.isShowingMore,
            toggleShowMore: this.cachedToggleShowMore,
            canToggleShowMore: false,
          },
          true
        );
      },

      render({ results, instantSearchInstance }) {
        const facetValues = results.getFacetValues(attribute, { sortBy });
        const facetItems =
          facetValues && facetValues.data ? facetValues.data : [];

        const items = transformItems(
          facetItems
            .slice(0, this.getLimit())
            .map(({ name: label, path: value, ...item }) => ({
              ...item,
              label,
              value,
            }))
        );

        this.toggleShowMore = this.createToggleShowMore({
          results,
          instantSearchInstance,
        });

        renderFn(
          {
            items,
            createURL: this._createURL,
            refine: this._refine,
            instantSearchInstance,
            canRefine: items.length > 0,
            widgetParams,
            isShowingMore: this.isShowingMore,
            toggleShowMore: this.cachedToggleShowMore,
            canToggleShowMore:
              showMore &&
              (this.isShowingMore || facetItems.length > this.getLimit()),
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

      getWidgetState(uiState, { searchParameters }) {
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
}
