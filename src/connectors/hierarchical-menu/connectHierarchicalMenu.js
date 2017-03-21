/**
 * Create a hierarchical menu using multiple attributes
 * @function hierarchicalMenu
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string[]} options.attributes Array of attributes to use to generate the hierarchy of the menu.
 * See the example for the convention to follow.
 * @param  {number} [options.limit=10] How much facet values to get [*]
 * @param  {string} [options.separator=">"] Separator used in the attributes to separate level values. [*]
 * @param  {string} [options.rootPath] Prefix path to use if the first level is not the root level.
 * @param  {string} [options.showParentLevel=false] Show the parent level of the current refined value
 * @param  {string[]|Function} [options.sortBy=['name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *   You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax).
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template (root level only)
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * @param  {string|Function} [options.templates.footer=''] Footer template (root level only)
 * @param  {Function} [options.transformData.item] Method to change the object passed to the `item` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there are no items in the menu
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.depth] CSS class to add to each item element to denote its depth. The actual level will be appended to the given class name (ie. if `depth` is given, the widget will add `depth0`, `depth1`, ... according to the level of each item).
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
const usage = `Usage:
connectHierarchicalMenu({
  attributes,
  [ separator=' > ' ],
  [ rootPath ],
  [ showParentLevel=true ],
  [ limit=10 ],
  [ sortBy=['name:asc'] ],
})`;
const connectHierarchicalMenu = renderHierarchicalMenu => ({
    attributes,
    separator = ' > ',
    rootPath = null,
    showParentLevel = true,
    limit = 10,
    sortBy = ['name:asc'],
  } = {}) => {
  if (!attributes || !attributes.length) {
    throw new Error(usage);
  }

  // we need to provide a hierarchicalFacet name for the search state
  // so that we can always map $hierarchicalFacetName => real attributes
  // we use the first attribute name
  const hierarchicalFacetName = attributes[0];

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
      this._toggleRefinement = facetValue => helper
        .toggleRefinement(hierarchicalFacetName, facetValue)
        .search();

      // Bind createURL to this specific attribute
      function _createURL(facetValue) {
        return createURL(helper.state.toggleRefinement(hierarchicalFacetName, facetValue));
      }

      renderHierarchicalMenu({
        attributeNameKey: 'path',
        createURL: _createURL,
        facetValues: [],
        templateProps: this._templateProps,
        toggleRefinement: this._toggleRefinement,
        instantSearchInstance,
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
    render({results, state, createURL}) {
      let facetValues = results.getFacetValues(hierarchicalFacetName, {sortBy}).data || [];
      facetValues = this._prepareFacetValues(facetValues, state);

      // Bind createURL to this specific attribute
      function _createURL(facetValue) {
        return createURL(state.toggleRefinement(hierarchicalFacetName, facetValue));
      }

      renderHierarchicalMenu({
        attributeNameKey: 'path',
        createURL: _createURL,
        facetValues,
        toggleRefinement: this._toggleRefinement,
      }, false);
    },
  };
};

export default connectHierarchicalMenu;
