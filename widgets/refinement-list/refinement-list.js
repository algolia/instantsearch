var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('../../lib/utils.js');

var autoHide = require('../../decorators/autoHide');
var bindProps = require('../../decorators/bindProps');
var headerFooter = require('../../decorators/headerFooter');
var RefinementList = autoHide(headerFooter(require('../../components/RefinementList')));
var Template = require('../../components/Template');

var defaultTemplates = require('./defaultTemplates');

/**
 * Instantiate a list of refinements based on a facet
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {String} [options.operator='or'] How to apply refinements. Possible values: `or`, `and`
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {String} [options.limit=1000] How much facet values to get
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
 * @param  {String|String[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {String|String[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {String|String[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.item=`<label>
  <input type="checkbox" value="{{name}}" {{#isRefined}}checked{{/isRefined}} />{{name}} <span>{{count}}</span>
</label>`] Item template, provided with `name`, `count`, `isRefined`
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the item template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when there's no results
 * @return {Object}
 */
function refinementList({
    container,
    facetName,
    operator = 'or',
    sortBy = ['count:desc'],
    limit = 1000,
    cssClasses = {},
    hideWhenNoResults = true,
    templates = defaultTemplates,
    transformData
  }) {
  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: refinementList({container, facetName, [operator, sortBy, limit, cssClasses.{root,list,item}, templates.{header,item,footer}, transformData, hideIfNoResults]})';

  if (!container || !facetName) {
    throw new Error(usage);
  }

  if (operator) {
    operator = operator.toLowerCase();
    if (operator !== 'and' && operator !== 'or') {
      throw new Error(usage);
    }
  }

  return {
    getConfiguration: (configuration) => {
      var widgetConfiguration = {
        [operator === 'and' ? 'facets' : 'disjunctiveFacets']: [facetName]
      };

      // set the maxValuesPerFacet to max(limit, currentValue)
      if (!configuration.maxValuesPerFacet || limit > configuration.maxValuesPerFacet) {
        widgetConfiguration.maxValuesPerFacet = limit;
      }

      return widgetConfiguration;
    },

    render: function({results, helper, templatesConfig}) {
      var templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      var facetValues = results.getFacetValues(facetName, {sortBy: sortBy}).slice(0, limit);

      ReactDOM.render(
        <RefinementList
          Template={bindProps(Template, templateProps)}
          cssClasses={cssClasses}
          facetValues={facetValues}
          hasResults={facetValues.length > 0}
          hideWhenNoResults={hideWhenNoResults}
          toggleRefinement={toggleRefinement.bind(null, helper, facetName)}
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

module.exports = refinementList;
