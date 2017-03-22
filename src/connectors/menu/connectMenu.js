import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customMenu = connectMenu(function render(params, isFirstRendering) {
  // params = {
  //   items,
  //   state,
  //   createURL,
  //   refine,
  //   helper,
  //   instantSearchInstance,
  //   canRefine,
  // }
});
search.addWidget(
  customMenu({
    attributeName,
    [ limit ],
    [ sortBy = ['count:desc', 'name:asc'] ]
  });
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectMenu.html
`;

/**
 * @typedef {Object} CustomMenuWidgetOptions
 * @param {string} attributeName Name of the attribute for faceting (eg. "free_shipping")
 * @param {number} [limit = 10] How many facets values to retrieve [*]
 * @param {string[]|function} [sortBy = ['count:desc', 'name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *   You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax). [*]
 */

/**
 * @typedef {Object} MenuRenderingOptions
 * @property {Object[]} items
 * @property {Object} state
 * @property {function} createURL
 * @property {function} refine
 * @property {AlgoliaSearchHelper} helper
 * @property {InstantSearch} instantSearchInstance
 * @property {boolean} canRefine
 */

 /**
  * Connects a rendering function with the menu business logic.
  * @param {function(MenuRenderingOptions)} renderFn function that renders the menu widget
  * @return {function(CustomMenuWidgetOptions)} a widget factory for menu widget
  */
export default function connectMenu(renderFn) {
  checkRendering(renderFn, usage);

  return ({
    attributeName,
    limit = 10,
    sortBy = ['count:desc', 'name:asc'],
  }) => {
    if (!attributeName) {
      throw new Error(usage);
    }

    return {
      getConfiguration(configuration) {
        const widgetConfiguration = {
          hierarchicalFacets: [{
            name: attributeName,
            attributes: [attributeName],
          }],
        };

        const currentMaxValuesPerFacet = configuration.maxValuesPerFacet || 0;
        widgetConfiguration.maxValuesPerFacet = Math.max(currentMaxValuesPerFacet, limit);

        return widgetConfiguration;
      },

      init({helper, createURL, instantSearchInstance}) {
        this._createURL = facetValue =>
          createURL(helper.state.toggleRefinement(attributeName, facetValue));

        this._refine = facetValue => helper
          .toggleRefinement(attributeName, facetValue)
          .search();

        this._helper = helper;

        renderFn({
          items: [],
          state: helper.state,
          createURL: this._createURL,
          refine: this._refine,
          helper: this._helper,
          instantSearchInstance,
          canRefine: false,
        }, true);
      },

      render({results, state, instantSearchInstance}) {
        const items = results.getFacetValues(attributeName, {sortBy}).data || [];

        renderFn({
          items,
          state,
          createURL: this._createURL,
          refine: this._refine,
          helper: this._helper,
          instantSearchInstance,
          canRefine: items.length > 0,
        }, false);
      },
    };
  };
}
