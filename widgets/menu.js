var React = require('react');
var cx = require('classnames');

var utils = require('../lib/widget-utils.js');

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

  var MultipleChoiceList = require('../components/MultipleChoiceList');

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
    render: function(results, state, helper) {
      React.render(
        <MultipleChoiceList
          rootClass={cx(rootClass)}
          itemClass={cx(itemClass)}
          facetValues={getFacetValues(results, hierarchicalFacetName, sortBy, limit)}
          template={template}
          toggleRefine={toggleRefine.bind(null, helper, hierarchicalFacetName)}
        />,
        containerNode
      );
    }
  };
}

function toggleRefine(helper, facetName, facetValue) {
  helper
    .toggleRefine(facetName, facetValue)
    .search();
}

function getFacetValues(results, hierarchicalFacetName, sortBy, limit) {
  return results
    .getFacetValues(hierarchicalFacetName, {sortBy: sortBy})
    .data.slice(0, limit);
}

module.exports = menu;
