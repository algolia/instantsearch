var React = require('react');
var cx = require('classnames');

var utils = require('../lib/utils.js');

var defaultTemplate = `<label>
  <input type="checkbox" value="{{name}}" {{#isRefined}}checked{{/isRefined}} />{{name}} <span>{{count}}</span>
</label>`;

/**
 * Instantiate a list of refinements based on a facet
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {String} options.operator How to apply refinements. Possible values: `or`, `and`
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {String} [options.limit=100] How much facet values to get.
 * @param  {String|String[]} [options.rootClass=null] CSS class(es) for the root `<ul>` element
 * @param  {String|String[]} [options.itemClass=null] CSS class(es) for the item `<li>` element
 * @param  {String|Function} [options.template] Item template, provided with `name`, `count`, `isRefined`
 * @param  {String|Function} [options.singleRefine=true] Are multiple refinements allowed or only one at the same time. You can use this
 *                                                       to build radio based refinement lists for example.
 * @return {Object}
 */
function refinementList({
    container = null,
    facetName = null,
    operator = null,
    sortBy = ['count:desc'],
    limit = 100,
    rootClass = null,
    itemClass = null,
    template = defaultTemplate,
    singleRefine = false
  }) {
  var RefinementList = require('../components/RefinementList');

  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: refinementList({container, facetName, operator[sortBy, limit, rootClass, itemClass, template]})';

  if (container === null ||
    facetName === null ||
    // operator is mandatory when multiple refines allowed
    (operator === null && singleRefine === false) ||
    // operator is not allowed when single refine enabled
    (operator !== null && singleRefine === true)) {
    throw new Error(usage);
  }

  operator = operator.toLowerCase();
  if (operator !== 'and' && operator !== 'or') {
    throw new Error(usage);
  }

  return {
    getConfiguration: () => ({
      [operator === 'and' ? 'facets' : 'disjunctiveFacets']: [facetName]
    }),
    render: function({results, helper}) {
      React.render(
        <RefinementList
          rootClass={cx(rootClass)}
          itemClass={cx(itemClass)}
          facetValues={results.getFacetValues(facetName, {sortBy: sortBy}).slice(0, limit)}
          template={template}
          toggleRefinement={toggleRefinement.bind(null, helper, singleRefine, facetName)}
        />,
        containerNode
      );
    }
  };
}

function toggleRefinement(helper, singleRefine, facetName, facetValue) {
  if (singleRefine) {
    helper.clearRefinement(facetName);
  }

  helper
    .toggleRefinement(facetName, facetValue)
    .search();
}

module.exports = refinementList;
