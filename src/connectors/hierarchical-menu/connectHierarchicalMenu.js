import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customToggle = connectHierarchicalMenu(function render(params, isFirstRendering) {
  // params = {
  //   createURL,
  //   items,
  //   refine,
  //   instantSearchInstance,
  // }
});
search.addWidget(
  customToggle({
    attributes,
    [ separator = ' > ' ],
    [ rootPath = null ],
    [ showParentLevel = true ],
    [ limit = 10 ],
    [ sortBy = ['isRefined', 'count:desc'] ],
  });
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectHierarchicalMenu.html
`;

/**
 * @typedef {Object} CustomHierarchicalMenuWidgetOptions
 * @param {string[]} attributes Array of attributes to use to generate the hierarchy of the menu.
 * @param  {string} [separator='>'] Separator used in the attributes to separate level values. [*]
 * @param  {string} [rootPath] Prefix path to use if the first level is not the root level.
 * @param  {string} [showParentLevel=false] Show the parent level of the current refined value
 * @param  {number} [limit=10] How much facet values to get [*]
 * @param  {string[]|Function} [sortBy=['isRefined', 'count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *   You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 */

/**
 * @typedef {Object} HierarchicalMenuRenderingOptions
 * @property {function} createURL function that create a url for the next state
 * @property {Object[]} items the values to be rendered
 * @property {function} refine set the path of the hierarchical filter and triggers a new search
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 * @property {Object} widgetParams all original options forwarded to rendering
 */

 /**
  * Connects a rendering function with the toggle business logic.
  * @param {function(HierarchicalMenuRenderingOptions)} renderFn function that renders the toggle widget
  * @return {function(CustomHierarchicalMenuWidgetOptions)} a custom toggle widget factory
  */
export default function connectHierarchicalMenu(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      attributes,
      separator = ' > ',
      rootPath = null,
      showParentLevel = true,
      limit = 10,
      sortBy = ['isRefined', 'count:desc'],
    } = widgetParams;

    if (!attributes || !attributes.length) {
      throw new Error(usage);
    }

    // we need to provide a hierarchicalFacet name for the search state
    // so that we can always map $hierarchicalFacetName => real attributes
    // we use the first attribute name
    const [hierarchicalFacetName] = attributes;

    return {
      getConfiguration: currentConfiguration => ({
        hierarchicalFacets: [{
          name: hierarchicalFacetName,
          attributes,
          separator,
          rootPath,
          showParentLevel,
        }],
        maxValuesPerFacet: currentConfiguration.maxValuesPerFacet !== undefined ?
          Math.max(currentConfiguration.maxValuesPerFacet, limit) :
          limit,
      }),

      init({helper, createURL, instantSearchInstance}) {
        this._refine = facetValue => helper
          .toggleRefinement(hierarchicalFacetName, facetValue)
          .search();

        // Bind createURL to this specific attribute
        function _createURL(facetValue) {
          return createURL(helper.state.toggleRefinement(hierarchicalFacetName, facetValue));
        }

        renderFn({
          createURL: _createURL,
          items: [],
          refine: this._refine,
          instantSearchInstance,
          widgetParams,
        }, true);
      },

      _prepareFacetValues(facetValues, state) {
        return facetValues
          .slice(0, limit)
          .map(subValue => {
            if (Array.isArray(subValue.data)) {
              subValue.data = this._prepareFacetValues(subValue.data, state);
            }

            return subValue;
          });
      },

      render({results, state, createURL, instantSearchInstance}) {
        const items = this._prepareFacetValues(
          results.getFacetValues(hierarchicalFacetName, {sortBy}).data || [],
          state
        );

        // Bind createURL to this specific attribute
        function _createURL(facetValue) {
          return createURL(state.toggleRefinement(hierarchicalFacetName, facetValue));
        }

        renderFn({
          createURL: _createURL,
          items,
          refine: this._refine,
          instantSearchInstance,
          widgetParams,
        }, false);
      },
    };
  };
}
