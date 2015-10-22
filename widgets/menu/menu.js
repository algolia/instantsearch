var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('../../lib/utils.js');
var bem = utils.bemHelper('ais-menu');
var cx = require('classnames/dedupe');
var autoHideContainer = require('../../decorators/autoHideContainer');
var headerFooter = require('../../decorators/headerFooter');
var RefinementList = autoHideContainer(headerFooter(require('../../components/RefinementList/RefinementList.js')));

var defaultTemplates = require('./defaultTemplates.js');

/**
 * Create a menu out of a facet
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} options.facetName Name of the attribute for faceting
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {String} [options.limit=100] How many facets values to retrieve
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
 * @param  {String|String[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {String|String[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {String|String[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {String|String[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {String|String[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {String|String[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {String|String[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {String|String[]} [options.cssClasses.link] CSS class to add to each link (when using the default template)
 * @param  {String|String[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Method to change the object passed to the item template
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when there's no results
 * @return {Object}
 */
function menu({
    container,
    facetName,
    sortBy = ['count:desc'],
    limit = 100,
    cssClasses = {},
    templates = defaultTemplates,
    transformData,
    hideContainerWhenNoResults = true
  }) {
  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: menu({container, facetName, [sortBy, limit, cssClasses.{root,list,item}, templates.{header,item,footer}, transformData, hideWhenResults]})';

  if (!container || !facetName) {
    throw new Error(usage);
  }

  // we use a hierarchicalFacet for the menu because that's one of the use cases
  // of hierarchicalFacet: a flat menu
  var hierarchicalFacetName = facetName;

  return {
    getConfiguration: () => ({
      hierarchicalFacets: [{
        name: hierarchicalFacetName,
        attributes: [facetName]
      }]
    }),
    render: function({results, helper, templatesConfig, state, createURL}) {
      var facetValues = getFacetValues(results, hierarchicalFacetName, sortBy, limit);

      var templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      cssClasses = {
        root: cx(bem(null), cssClasses.root),
        header: cx(bem('header'), cssClasses.header),
        body: cx(bem('body'), cssClasses.body),
        footer: cx(bem('footer'), cssClasses.footer),
        list: cx(bem('list'), cssClasses.list),
        item: cx(bem('item'), cssClasses.item),
        active: cx(bem('item', 'active'), cssClasses.active),
        link: cx(bem('link'), cssClasses.link),
        count: cx(bem('count'), cssClasses.count)
      };

      ReactDOM.render(
        <RefinementList
          createURL={(facetValue) => createURL(state.toggleRefinement(hierarchicalFacetName, facetValue))}
          cssClasses={cssClasses}
          facetValues={facetValues}
          hasResults={facetValues.length > 0}
          hideContainerWhenNoResults={hideContainerWhenNoResults}
          templateProps={templateProps}
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
