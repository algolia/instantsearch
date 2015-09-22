var React = require('react');
var cx = require('classnames');

var utils = require('../lib/utils.js');

var defaultTemplate = `<a href="{{href}}">{{name}}</a> {{count}}`;

var hierarchicalCounter = 0;

/**
 * Instantiate a list of refinements based on a facet
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {String} [options.limit=100] How much facet values to get.
 * @param  {String|String[]} [options.rootClass=null] CSS class(es) for the root `<ul>` element
 * @param  {String|String[]} [options.itemClass=null] CSS class(es) for the item `<li>` element
 * @param  {String|Function} [options.template] Item template, provided with `name`, `count`, `isRefined`
 * @return {Object}
 */
function menu({
    container = null,
    facetName = null,
    sortBy = ['count:desc'],
    limit = 100,
    rootClass = null,
    itemClass = null,
    template = defaultTemplate
  }) {
  hierarchicalCounter++;

  var RefinementList = require('../components/RefinementList');

  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: menu({container, facetName, [sortBy, limit, rootClass, itemClass, template]})';

  if (container === null || facetName === null) {
    throw new Error(usage);
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
      React.render(
        <RefinementList
          rootClass={cx(rootClass)}
          itemClass={cx(itemClass)}
          facetValues={getFacetValues(results, hierarchicalFacetName, sortBy, limit)}
          template={template}
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
