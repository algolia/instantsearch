var React = require('react');

var utils = require('../lib/utils.js');

var defaultTemplates = {
  header: '',
  footer: '',
  item: `<label>
  <input type="checkbox" value="{{name}}" {{#isRefined}}checked{{/isRefined}} />{{name}} <span>{{count}}</span>
</label>`
};

/**
 * Instantiate a list of refinements based on a facet
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {String} options.operator How to apply refinements. Possible values: `or`, `and`
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {String} [options.limit=100] How much facet values to get
 * @param  {Object} [options.cssClasses] Css classes to add to the wrapping elements: root, list, item
 * @param  {String|String[]} [options.cssClasses.root]
 * @param  {String|String[]} [options.cssClasses.list]
 * @param  {String|String[]} [options.cssClasses.item]
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header] Header template
 * @param  {String|Function} [options.templates.item=`<label>
  <input type="checkbox" value="{{name}}" {{#isRefined}}checked{{/isRefined}} />{{name}} <span>{{count}}</span>
</label>`] Item template, provided with `name`, `count`, `isRefined`
 * @param  {String|Function} [options.templates.footer] Footer template
 * @param  {String|Function} [options.singleRefine=true] Are multiple refinements allowed or only one at the same time. You can use this
 *                                                       to build radio based refinement lists for example
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when no results match
 * @return {Object}
 */
function refinementList({
    container = null,
    facetName = null,
    operator = null,
    sortBy = ['count:desc'],
    limit = 100,
    cssClasses = {
      root: null,
      list: null,
      item: null
    },
    hideWhenNoResults = true,
    templates = defaultTemplates,
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

  if (templates !== defaultTemplates) {
    templates = Object.assign({}, defaultTemplates, templates);
  }

  return {
    getConfiguration: () => ({
      [operator === 'and' ? 'facets' : 'disjunctiveFacets']: [facetName]
    }),
    render: function({results, helper}) {
      var values = results.getFacetValues(facetName, {sortBy: sortBy}).slice(0, limit);

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
          facetValues={results.getFacetValues(facetName, {sortBy: sortBy}).slice(0, limit)}
          templates={templates}
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
