var React = require('react');

var utils = require('../lib/utils.js');


var defaultTemplates = {
  header: '',
  footer: '',
  item: '<a href="{{href}}">{{name}}</a> {{count}}'
};

var hierarchicalCounter = 0;

/**
 * Create a menu out of a facet
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {String} [options.limit=100] How much facet values to get
 * @param  {Object} [options.cssClasses] Css classes to add to the wrapping elements: root, list, item
 * @param  {String|String[]} [options.cssClasses.root]
 * @param  {String|String[]} [options.cssClasses.list]
 * @param  {String|String[]} [options.cssClasses.item]
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.item='<a href="{{href}}">{{name}}</a> {{count}}'] Item template, provided with `name`, `count`, `isRefined`
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Method to change the object passed to the item template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when no results match
 * @return {Object}
 */
function menu({
    container = null,
    facetName = null,
    sortBy = ['count:desc'],
    limit = 100,
    cssClasses = {
      root: null,
      list: null,
      item: null
    },
    hideWhenNoResults = true,
    templates = defaultTemplates,
    transformData = null
  }) {
  hierarchicalCounter++;

  var RefinementList = require('../components/RefinementList');

  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: menu({container, facetName, [sortBy, limit, rootClass, itemClass, templates.{header,item,footer}, transformData]})';

  if (container === null || facetName === null) {
    throw new Error(usage);
  }

  if (templates !== defaultTemplates) {
    templates = Object.assign({}, defaultTemplates, templates);
  }

  var hierarchicalFacetName = 'instantsearch.js' + hierarchicalCounter;

  return {
    getConfiguration: () => ({
      hierarchicalFacets: [{
        name: hierarchicalFacetName,
        attributes: [facetName]
      }]
    }),
    render: function({results, helper}) {
      var values = getFacetValues(results, hierarchicalFacetName, sortBy, limit);

      if (values.length === 0) {
        React.render(<div/>, containerNode);
        if (hideWhenNoResults === true) {
          containerNode.classList.add('as-display-none');
        }
        return;
      }

      if (hideWhenNoResults === true) {
        containerNode.classList.remove('as-display-none');
      }

      React.render(
        <RefinementList
          cssClasses={cssClasses}
          facetValues={getFacetValues(results, hierarchicalFacetName, sortBy, limit)}
          templates={templates}
          transformData={transformData}
          toggleRefinement={toggleRefinement.bind(null, helper, hierarchicalFacetName)}
        />,
        containerNode
      );
    }
  };
}

function toggleRefinement(helper, facetName, facetValue) {
  helper
    .toggleRefinement(facetName, facetValue)
    .search();
}

function getFacetValues(results, hierarchicalFacetName, sortBy, limit) {
  var values = results
    .getFacetValues(hierarchicalFacetName, {sortBy: sortBy});

  return values.data && values.data.slice(0, limit) || [];
}

module.exports = menu;
