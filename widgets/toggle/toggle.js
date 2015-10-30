var find = require('lodash/collection/find');
var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('../../lib/utils.js');
var bem = utils.bemHelper('ais-toggle');
var cx = require('classnames');

var autoHideContainer = require('../../decorators/autoHideContainer');
var headerFooter = require('../../decorators/headerFooter');

var defaultTemplates = require('./defaultTemplates');

/**
 * Instantiate the toggling of a boolean facet filter on and off.
 * Note that it will not toggle between `true` and `false, but between `true`
 * and `undefined`.
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.facetName Name of the attribute for faceting (eg. "free_shipping")
 * @param  {string} options.label Human-readable name of the filter (eg. "Free Shipping")
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.label] CSS class to add to each label element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.checkbox] CSS class to add to each checkbox element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count element (when using the default template)
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.item] Item template
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the item template
 * @param  {boolean} [hideContainerWhenNoResults=true] Hide the container when there's no results
 * @return {Object}
 */
function toggle({
    container,
    facetName,
    label,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
    transformData,
    hideContainerWhenNoResults = true
  } = {}) {
  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: toggle({container, facetName, label[, cssClasses.{root,header,body,footer,list,item,active,label,checkbox,count}, templates.{header,item,footer}, transformData, hideContainerWhenNoResults]})';

  var RefinementList = headerFooter(require('../../components/RefinementList/RefinementList.js'));
  if (hideContainerWhenNoResults === true) {
    RefinementList = autoHideContainer(RefinementList);
  }

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
      var hasNoResults = results.nbHits === 0;

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

      var cssClasses = {
        root: cx(bem(null), userCssClasses.root),
        header: cx(bem('header'), userCssClasses.header),
        body: cx(bem('body'), userCssClasses.body),
        footer: cx(bem('footer'), userCssClasses.footer),
        list: cx(bem('list'), userCssClasses.list),
        item: cx(bem('item'), userCssClasses.item),
        active: cx(bem('item', 'active'), userCssClasses.active),
        label: cx(bem('label'), userCssClasses.label),
        checkbox: cx(bem('checkbox'), userCssClasses.checkbox),
        count: cx(bem('count'), userCssClasses.count)
      };

      ReactDOM.render(
        <RefinementList
          createURL={() => createURL(state.toggleRefinement(facetName, facetValue.isRefined))}
          cssClasses={cssClasses}
          facetValues={[facetValue]}
          shouldAutoHideContainer={hasNoResults}
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
