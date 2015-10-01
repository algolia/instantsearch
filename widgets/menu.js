var React = require('react');

var utils = require('../lib/utils.js');
var autoHide = require('../decorators/autoHide');
var bindProps = require('../decorators/bindProps');
var headerFooter = require('../decorators/headerFooter');
var RefinementList = autoHide(headerFooter(require('../components/RefinementList')));
var Template = require('../components/Template');

var hierarchicalCounter = 0;
var defaultTemplates = {
  header: '',
  item: '<a href="{{href}}">{{name}}</a> {{count}}',
  footer: ''
};

/**
 * Create a menu out of a facet
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {String} [options.limit=100] How many facets values to retrieve
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
 * @param  {String|String[]} [options.cssClasses.root] CSS class to be added to the wrapper element
 * @param  {String|String[]} [options.cssClasses.list] CSS class to be added to the list element
 * @param  {String|String[]} [options.cssClasses.item] CSS class to be added to each item of the list
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.item='<a href="{{href}}">{{name}}</a> {{count}}'] Item template, provided with `name`, `count`, `isRefined`
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Method to change the object passed to the item template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when there's no results
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
    templates = defaultTemplates,
    transformData,
    hideWhenNoResults = true
  }) {
  hierarchicalCounter++;

  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: menu({container, facetName, [sortBy, limit, cssClasses.{root,list,item}, templates.{header,item,footer}, transformData, hideWhenResults]})';

  if (container === null || facetName === null) {
    throw new Error(usage);
  }

  var hierarchicalFacetName = 'instantsearch.js-menu' + hierarchicalCounter;

  return {
    getConfiguration: () => ({
      hierarchicalFacets: [{
        name: hierarchicalFacetName,
        attributes: [facetName]
      }]
    }),
    render: function({results, helper, templatesConfig}) {
      var facetValues = getFacetValues(results, hierarchicalFacetName, sortBy, limit);

      var templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      React.render(
        <RefinementList
          cssClasses={cssClasses}
          facetValues={facetValues}
          Template={bindProps(Template, templateProps)}
          hideWhenNoResults={hideWhenNoResults}
          hasResults={facetValues.length > 0}
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
