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
  //   isShowingMore,
  //   toggleShowMore
  // }
});
search.addWidget(
  customMenu({
    attributeName,
    [ limit ],
    [ showMoreLimit ]
    [ sortBy = ['isRefined', 'count:desc'] ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectMenu.html
`;

/**
 * @typedef {Object} CustomMenuWidgetOptions
 * @property {string} attributeName Name of the attribute for faceting (eg. "free_shipping").
 * @property {number} [limit = 10] How many facets values to retrieve [*].
 * @property {number} [showMoreLimit] How many facets values to retrieve when `toggleShowMore` is called, this value is meant to be greater than `limit` option.
 * @property {string[]|function} [sortBy = ['isRefined', 'count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *   You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax). [*]
 */

/**
 * @typedef {Object} MenuRenderingOptions
 * @property {Object[]} items The elements that can be refined for the current search results.
 * @property {function} createURL Creates the URL for a single item name in the list.
 * @property {function(item)} refine Filter the search to item value.
 * @property {boolean} canRefine True if refinement can be applied.
 * @property {Object} widgetParams All original `CustomMenuWidgetOptions` forwarded to the `renderFn`.
 * @property {boolean} isShowingMore Does the menu is displaying all the results.
 * @property {function} toggleShowMore Action to call for switching between show less and more.
 */

 /**
  * **Menu** connector provides the logic to build a widget that will give the user the ability to choose a single value for a specific facet.
  * This connector provides a `MenuRenderingOptions.toggleShowMore()` function to display more or less items.
  * @type {Connector}
  * @param {function(MenuRenderingOptions, boolean)} renderFn Rendering function for the custom **Menu** widget. widget.
  * @return {function(CustomMenuWidgetOptions)} Re-usable widget factory for a custom **Menu** widget.
  * @example
  * var $ = window.$;
  * var instantsearch = window.instantsearch;
  *
  * // custom `renderFn` to render the custom ClearAll widget
  * function renderFn(MenuRenderingOptions, isFirstRendering) {
  *  if (isFirstRendering) {
  *    MenuRenderingOptions.widgetParams.containerNode
  *      .html('<select></select');
  *
  *    MenuRenderingOptions.widgetParams.containerNode
  *      .find('select')
  *      .on('change', function(event) {
  *        MenuRenderingOptions.refine(event.target.value);
  *      });
  *  }
  *
  *  var options = MenuRenderingOptions.items.map(function(item) {
  *    return item.isRefined
  *      ? '<option value="' + item.value '" selected>' + item.label + '</option>'
  *      : '<option value="' + item.value '">' + item.label + '</option>';
  *  });
  *
  *  MenuRenderingOptions.widgetParams.containerNode
  *    .find('select')
  *    .html(options);
  *
  * }
  *
  * // connect `renderFn` to Menu logic
  * var customMenu = instantsearch.connectors.connectMenu(renderFn);
  *
  * // mount widget on the page
  * search.addWidget(
  *   customMenu({
  *     containerNode: $('#custom-menu-container'),
  *     attributeName: 'categories',
  *     limit: 3,
  *   })
  * );
}
  */
export default function connectMenu(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      attributeName,
      limit = 10,
      sortBy = ['isRefined', 'count:desc'],
      showMoreLimit,
    } = widgetParams;

    if (
      !attributeName ||
      !isNaN(showMoreLimit) && showMoreLimit < limit
    ) {
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
        return this.isShowingMore ? showMoreLimit : limit;
      },

      getConfiguration(configuration) {
        const widgetConfiguration = {
          hierarchicalFacets: [{
            name: attributeName,
            attributes: [attributeName],
          }],
        };

        const currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
        widgetConfiguration.maxValuesPerFacet = Math.max(currentMaxValuesPerFacet, showMoreLimit || limit);

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
          isShowingMore: this.isShowingMore,
          toggleShowMore: this.cachedToggleShowMore,
        }, true);
      },

      render({results, instantSearchInstance}) {
        const items = (results.getFacetValues(attributeName, {sortBy}).data || [])
          .slice(0, this.getLimit())
          .map(({name: label, path: value, ...item}) => ({...item, label, value}));

        this.toggleShowMore = this.createToggleShowMore({results, instantSearchInstance});

        renderFn({
          items,
          createURL: this._createURL,
          refine: this._refine,
          instantSearchInstance,
          canRefine: items.length > 0,
          widgetParams,
          isShowingMore: this.isShowingMore,
          toggleShowMore: this.cachedToggleShowMore,
        }, false);
      },
    };
  };
}
