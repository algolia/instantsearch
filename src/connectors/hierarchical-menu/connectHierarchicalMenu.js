import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customHierarchicalMenu = connectHierarchicalMenu(function renderFn(params, isFirstRendering) {
  // params = {
  //   createURL,
  //   items,
  //   refine,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customHierarchicalMenu({
    attributes,
    [ separator = ' > ' ],
    [ rootPath = null ],
    [ showParentLevel = true ],
    [ limit = 10 ],
    [ sortBy = ['isRefined', 'count:desc'] ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectHierarchicalMenu.html
`;

/**
 * @typedef {Object} HierarchicalMenuItem
 * @property {string} value Value of the menu item.
 * @property {string} label Human-readable value of the menu item.
 * @property {number} count Number of matched results after refinement is applied.
 * @property {isRefined} boolean Indicates if the refinement is applied.
 * @property {Object} [data] n+1 level of items, same structure HierarchicalMenuItem (default: `undefined`).
 */

/**
 * @typedef {Object} CustomHierarchicalMenuWidgetOptions
 * @property {string[]} attributesof Attributes to use to generate the hierarchy of the menu.
 * @property {string} [separator='>'] Separator used in the attributes to separate level values (default: `>`).
 * @property {string} [rootPath] Prefix path to use if the first level is not the root level (default: `null`).
 * @property {string} [showParentLevel] Show the parent level of the current refined value (default: `true`).
 * @property {number} [limit] How much facet values to get (default: `10`).
 * @property {string[]|function} [sortBy] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *
 * You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 *
 * (default: `['isRefined', 'count:desc']`).
 */

/**
 * @typedef {Object} HierarchicalMenuRenderingOptions
 * @property {function(item.value): string} createURL Create an url for the next state for a clicked item.
 * @property {HierarchicalMenuItem[]} items Values to be rendered.
 * @property {function(item.value)} refine Set the path of the hierarchical filter and triggers a new search.
 * @property {Object} widgetParams All original `CustomHierarchicalMenuWidgetOptions` forwarded to the `renderFn`.
 */

 /**
  * **HierarchicalMenu** connector provides the logic to build a custom widget that will give the user the ability to explore a tree-like structure.
  * This is commonly used for multi-level categorization of products on e-commerce websites. From a UX point of view, we suggest not displaying more than two levels deep.
  *
  * There's a complete example available on how to write a custom **HierarchicalMenu**: [hierarchicalMenu.js](https://github.com/algolia/instantsearch.js/blob/feat/instantsearch.js/v2/dev/app/custom-widgets/jquery/hierarchicalMenu.js)
  * @type {Connector}
  * @param {function(HierarchicalMenuRenderingOptions)} renderFn Rendering function for the custom **HierarchicalMenu** widget.
  * @return {function(CustomHierarchicalMenuWidgetOptions)} Re-usable widget factory for a custom **HierarchicalMenu** widget.
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
          .map(({name: label, path: value, ...subValue}) => {
            if (Array.isArray(subValue.data)) {
              subValue.data = this._prepareFacetValues(subValue.data, state);
            }
            return {...subValue, label, value};
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
