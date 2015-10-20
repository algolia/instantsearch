var find = require('lodash/collection/find');
var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('../../lib/utils.js');
var bem = utils.bemHelper('ais-toggle');
var cx = require('classnames/dedupe');

var autoHide = require('../../decorators/autoHide');
var headerFooter = require('../../decorators/headerFooter');

var defaultTemplates = require('./defaultTemplates');

/**
 * Instantiate the toggling of a boolean facet filter on and off.
 * Note that it will not toggle between `true` and `false, but between `true`
 * and `undefined`.
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} options.facetName Name of the attribute for faceting (eg. "free_shipping")
 * @param  {String} options.label Human-readable name of the filter (eg. "Free Shipping")
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {String|String[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {String|String[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {String|String[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {String|String[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {String|String[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {String|String[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {String|String[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {String|String[]} [options.cssClasses.label] CSS class to add to each label element (when using the default template)
 * @param  {String|String[]} [options.cssClasses.checkbox] CSS class to add to each checkbox element (when using the default template)
 * @param  {String|String[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.item] Item template
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the item template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when there's no results
 * @return {Object}
 */
function toggle({
    container,
    facetName,
    label,
    templates = defaultTemplates,
    cssClasses = {},
    transformData,
    hideWhenNoResults = true
  } = {}) {
  var RefinementList = autoHide(headerFooter(require('../../components/RefinementList')));
  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: toggle({container, facetName, label[, cssClasses.{root,header,body,footer,list,item,active,label,checkbox,count}, templates.{header,item,footer}, transformData, hideWhenNoResults]})';

  if (!container || !facetName || !label) {
    throw new Error(usage);
  }

  return {
    getConfiguration: () => ({
      facets: [facetName]
    }),
    render: function({helper, results, templatesConfig, state, createURL}) {
      var isRefined = helper.hasRefinements(facetName);
      var values = find(results.getFacetValues(facetName), {name: isRefined.toString()});

      var templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      var facetValue = {
        name: label,
        isRefined: isRefined,
        count: values && values.count || null
      };

      cssClasses = {
        root: cx(bem(null), cssClasses.root),
        header: cx(bem('header'), cssClasses.header),
        body: cx(bem('body'), cssClasses.body),
        footer: cx(bem('footer'), cssClasses.footer),
        list: cx(bem('list'), cssClasses.list),
        item: cx(bem('item'), cssClasses.item),
        active: cx(bem('item', 'active'), cssClasses.active),
        label: cx(bem('label'), cssClasses.label),
        checkbox: cx(bem('checkbox'), cssClasses.checkbox),
        count: cx(bem('count'), cssClasses.count)
      };

      ReactDOM.render(
        <RefinementList
          createURL={() => createURL(state.toggleRefinement(facetName, facetValue.isRefined))}
          cssClasses={cssClasses}
          facetValues={[facetValue]}
          hasResults={results.hits.length > 0}
          hideWhenNoResults={hideWhenNoResults}
          templateProps={templateProps}
          toggleRefinement={toggleRefinement.bind(null, helper, facetName, facetValue.isRefined)}
        />,
        containerNode
      );
    }
  };
}

function toggleRefinement(helper, facetName, isRefined) {
  var action = isRefined ? 'remove' : 'add';

  helper[action + 'FacetRefinement'](facetName, true);
  helper.search();
}

module.exports = toggle;
