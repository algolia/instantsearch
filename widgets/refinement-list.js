var React = require('react');

var utils = require('../lib/utils.js');

var autoHide = require('../decorators/autoHide');
var prepareProps = require('../decorators/prepareProps');
var headerFooter = require('../decorators/headerFooter');
var RefinementList = autoHide(headerFooter(require('../components/RefinementList')));
var Template = require('../components/Template');

var defaultTemplates = {
  header: '',
  item: `<label>
<input type="checkbox" value="{{name}}" {{#isRefined}}checked{{/isRefined}} />{{name}} <span>{{count}}</span>
</label>`,
  footer: ''
};

/**
 * Instantiate a list of refinements based on a facet
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {String} options.operator How to apply refinements. Possible values: `or`, `and`
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {String} [options.limit=100] How much facet values to get
 * @param  {Object} [options.cssClasses] Css classes to add to the wrapping elements: root, list, item
 * @param  {String|String[]} [options.cssClasses.root]
 * @param  {String|String[]} [options.cssClasses.list]
 * @param  {String|String[]} [options.cssClasses.item]
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.item=`<label>
  <input type="checkbox" value="{{name}}" {{#isRefined}}checked{{/isRefined}} />{{name}} <span>{{count}}</span>
</label>`] Item template, provided with `name`, `count`, `isRefined`
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the item template
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
    transformData,
    singleRefine = false
  }) {
  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: refinementList({container, facetName, operator[sortBy, limit, rootClass, itemClass, templates.{header,item,footer}, transformData]})';

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
    render: function({results, helper, templatesConfig}) {
      var templateProps = {
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      };

      var facetValues = results.getFacetValues(facetName, {sortBy: sortBy}).slice(0, limit);

      React.render(
        <RefinementList
          cssClasses={cssClasses}
          facetValues={facetValues}
          hideWhenNoResults={hideWhenNoResults}
          hasResults={facetValues.length > 0}
          Template={prepareProps(Template, templateProps)}
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
