import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customMenu = connectMenu(function render(params, isFirstRendering) {
  // params = {
  //   items,
  //   createURL,
  //   refine,
  //   instantSearchInstance,
  //   canRefine,
  //   widgetParams,
  //   currentRefinement,
  //   isShowingMore,
  //   toggleShowMore
  // }
});
search.addWidget(
  customMenu({
    attributeName,
    [ limit ],
    [ showMoreLimit = 0 ]
    [ sortBy = ['isRefined', 'count:desc'] ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectMenu.html
`;

/**
 * @typedef {Object} CustomMenuWidgetOptions
 * @param {string} attributeName Name of the attribute for faceting (eg. "free_shipping")
 * @param {number} [limit = 10] How many facets values to retrieve [*]
 * @param {number} [showMoreLimit = 0] How many facets values to retrieve when `toggleShowMore` is called
 * @param {string[]|function} [sortBy = ['isRefined', 'count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *   You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax). [*]
 */

/**
 * @typedef {Object} MenuRenderingOptions
 * @property {Object[]} items the elements that can be refined for the current search results
 * @property {function} createURL creates the URL for a single item name in the list
 * @property {function} refine filter the search to item.name value
 * @property {boolean} canRefine true if refinement can be applied
 * @property {Object} widgetParams all original options forwarded to rendering
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 * @property {Object} currentRefinement the refinement currently applied
 * @property {boolean} isShowingMore is displaying all the results
 * @property {function} toggleShowMore switch between show less and more
 */

 /**
  * Connects a rendering function with the menu business logic.
  * @param {function(MenuRenderingOptions, boolean)} renderFn function that renders the menu widget
  * @return {function(CustomMenuWidgetOptions)} a widget factory for menu widget
  */
export default function connectMenu(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      attributeName,
      limit = 10,
      sortBy = ['isRefined', 'count:desc'],
      showMoreLimit = 0,
    } = widgetParams;

    if (!attributeName) {
      throw new Error(usage);
    }

    return {
      isShowingMore: false,

      // Provide the same function to the `renderFn` so that way the user
      // has to only bind it once when `isFirstRendering` for instance
      toggleShowMore() {},
      cachedToggleShowMore() { this.toggleShowMore(); },

      createToggleShowMore({results, instantSearchInstance}) {
        return () => {
          this.isShowingMore = !this.isShowingMore;
          this.render({results, instantSearchInstance});
        };
      },

      getLimit() {
        return showMoreLimit > limit && this.isShowingMore
          ? showMoreLimit
          : limit;
      },

      getConfiguration(configuration) {
        const widgetConfiguration = {
          hierarchicalFacets: [{
            name: attributeName,
            attributes: [attributeName],
          }],
        };

        const currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
        widgetConfiguration.maxValuesPerFacet = Math.max(currentMaxValuesPerFacet, limit, showMoreLimit);

        return widgetConfiguration;
      },

      init({helper, createURL, instantSearchInstance}) {
        this.cachedToggleShowMore = this.cachedToggleShowMore.bind(this);

        this._createURL = facetValue =>
          createURL(helper.state.toggleRefinement(attributeName, facetValue));

        this._refine = facetValue => helper
          .toggleRefinement(attributeName, facetValue)
          .search();

        this._helper = helper;

        renderFn({
          items: [],
          createURL: this._createURL,
          refine: this._refine,
          instantSearchInstance,
          canRefine: false,
          widgetParams,
          currentRefinement: null,
          isShowingMore: this.isShowingMore,
          toggleShowMore: this.cachedToggleShowMore,
        }, true);
      },

      render({results, instantSearchInstance}) {
        const items = results.getFacetValues(attributeName, {sortBy}).data || [];
        const itemsWithLimit = items.slice(0, this.getLimit());

        this.toggleShowMore = this.createToggleShowMore({results, instantSearchInstance});

        renderFn({
          items: itemsWithLimit,
          createURL: this._createURL,
          refine: this._refine,
          instantSearchInstance,
          canRefine: items.length > 0,
          widgetParams,
          currentRefinement: items.find(({isRefined}) => isRefined),
          isShowingMore: this.isShowingMore,
          toggleShowMore: this.cachedToggleShowMore,
        }, false);
      },
    };
  };
}
