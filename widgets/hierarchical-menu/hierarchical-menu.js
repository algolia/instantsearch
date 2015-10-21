var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('../../lib/utils.js');
var bem = utils.bemHelper('ais-hierarchical-menu');
var cx = require('classnames/dedupe');
var autoHide = require('../../decorators/autoHide');
var headerFooter = require('../../decorators/headerFooter');
var RefinementList = autoHide(headerFooter(require('../../components/RefinementList')));

var defaultTemplates = require('./defaultTemplates.js');

/**
 * Create a hierarchical menu using multiple attributes
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String[]} options.attributes Array of attributes to use to generate the hierarchy of the menu.
 * You need to follow some conventions:
 * @param  {String[]} [options.sortBy=['count:desc']] How to sort refinements. Possible values: `count|isRefined|name:asc|desc`
 * @param  {Number} [options.limit=100] How much facet values to get
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
 * @param  {String|Function} [options.templates.header=''] Header template (root level only)
 * @param  {String|Function} [options.templates.item] Item template
 * @param  {String|Function} [options.templates.footer=''] Footer template (root level only)
 * @param  {Function} [options.transformData] Method to change the object passed to the item template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when there's no results
 * @return {Object}
 */
function hierarchicalMenu({
    container,
    attributes = [],
    separator,
    limit = 100,
    sortBy = ['name:asc'],
    cssClasses = {},
    hideWhenNoResults = true,
    templates = defaultTemplates,
    transformData
  }) {
  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: hierarchicalMenu({container, attributes, [separator, sortBy, limit, cssClasses.{root, list, item}, templates.{header, item, footer}, transformData]})';

  if (!container || !attributes || !attributes.length) {
    throw new Error(usage);
  }

  // we need to provide a hierarchicalFacet name for the search state
  // so that we can always map $hierarchicalFacetName => real attributes
  // we use the first attribute name
  var hierarchicalFacetName = attributes[0];

  return {
    getConfiguration: () => ({
      hierarchicalFacets: [{
        name: hierarchicalFacetName,
        attributes,
        separator
      }]
    }),
    render: function({results, helper, templatesConfig, createURL, state}) {
      var facetValues = getFacetValues(results, hierarchicalFacetName, sortBy);

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
          facetNameKey="path"
          facetValues={facetValues}
          hasResults={facetValues.length > 0}
          hideWhenNoResults={hideWhenNoResults}
          limit={limit}
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

function getFacetValues(results, hierarchicalFacetName, sortBy) {
  var values = results
    .getFacetValues(hierarchicalFacetName, {sortBy: sortBy});

  return values.data || [];
}

module.exports = hierarchicalMenu;
