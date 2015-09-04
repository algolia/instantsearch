var React = require('react');
var cx = require('classnames');

var utils = require('../../lib/widgetUtils.js');

var defaultTemplate = `<label>
  <input type="checkbox" value="{{name}}" {{#isRefined}}checked{{/isRefined}} />{{name}} <span>{{count}}</span>
</label>`;

/**
 * Instantiate a list of refinement based on a facet
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {String} options.operator How to apply refinements. Possible values: `or`, `and`
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {String} [options.limit=100] How much facet values to get.
 * @param  {String|String[]} [options.cssClass=null] CSS class(es) for the main `<ul>` wrapper.
 * @param  {String|Function} [options.template] Item template, provided with `name`, `count`, `isRefined`
 * @return {Object}
 */
function multipleChoiceList({
    container = null,
    facetName = null,
    operator = null,
    sortBy = ['count:desc'],
    limit = 100,
    cssClass = null,
    template = defaultTemplate
  }) {
  var usage = 'Usage: multipleChoiceList({container, facetName, operator[sortBy, limit, cssClass, template]})';

  var MultipleChoiceList = require('../../components/MultipleChoiceList');
  var containerNode = utils.getContainerNode(container);

  if (container === null ||
    facetName === null ||
    operator === null) {
    throw new Error(usage);
  }

  operator = operator.toLowerCase();
  if (operator !== 'and' && operator !== 'or') {
    throw new Error(usage);
  }

  return {
    getConfiguration: () => ({
      maxValuesPerFacet: limit,
      [operator === 'and' ? 'facets' : 'disjunctiveFacets']: [facetName]
    }),
    render: function(results, state, helper) {
      React.render(
        <MultipleChoiceList
          cssClass={cx(cssClass)}
          facetValues={results.getFacetValues(facetName, {sortBy: sortBy})}
          search={helper.search.bind(helper)}
          template={template}
          toggleRefine={helper.toggleRefine.bind(helper, facetName)}
        />,
        containerNode
      );
    }
  };
}

module.exports = multipleChoiceList;
