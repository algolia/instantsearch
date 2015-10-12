var find = require('lodash/collection/find');
var React = require('react');
var ReactDOM = require('react-dom');

var utils = require('../lib/utils.js');

var autoHide = require('../decorators/autoHide');
var headerFooter = require('../decorators/headerFooter');
var bindProps = require('../decorators/bindProps');
var RefinementList = autoHide(headerFooter(require('../components/RefinementList')));

var Template = require('../components/Template');

var defaultTemplates = {
  header: '',
  item: `<label>
<input type="checkbox" {{#isRefined}}checked{{/isRefined}} />{{label}} <span>{{count}}</span>
</label>`,
  footer: ''
};

/**
 * Instantiate the toggling of a boolean facet filter on and off.
 * Note that it will not toggle between `true` and `false, but between `true`
 * and `undefined`.
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} options.facetName Name of the attribute for faceting (eg. "free_shipping")
 * @param  {String} options.label Human-readable name of the filter (eg. "Free Shipping")
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
 * @param  {String|String[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {String|String[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {String|String[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.item='<label>{{label}}<input type="checkbox" {{#isRefined}}checked{{/isRefined}} /></label>'] Body template
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the item template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when there's no results
 * @return {Object}
 */
function toggle({
    container = null,
    facetName = null,
    label = null,
    templates = defaultTemplates,
    cssClasses = {
      root: null
    },
    transformData,
    hideWhenNoResults = true
  }) {
  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: toggle({container, facetName, label[, template, transformData]})';

  if (container === null || facetName === null || label === null) {
    throw new Error(usage);
  }

  return {
    getConfiguration: () => ({
      facets: [facetName]
    }),
    render: function({helper, results, templatesConfig}) {
      var isRefined = helper.hasRefinements(facetName);
      var values = find(results.getFacetValues(facetName), {name: isRefined.toString()});

      var templateProps = utils.prepareTemplateProps({
        transformData: prepareToggleData(transformData),
        defaultTemplates,
        templatesConfig,
        templates: {
          header: templates.header,
          item: templates.body,
          footer: templates.footer
        }
      });

      var facetValue = {
        name: label,
        isRefined: isRefined,
        count: values && values.count || null
      };

      ReactDOM.render(
        <RefinementList
          Template={bindProps(Template, templateProps)}
          cssClasses={cssClasses}
          facetValues={[facetValue]}
          hasResults={results.hits.length > 0}
          hideWhenNoResults={hideWhenNoResults}
          toggleRefinement={toggleRefinement.bind(null, helper, facetName, facetValue.isRefined)}
        />,
        containerNode
      );
    }
  };
}

function prepareToggleData(transformData) {
  return function(data) {
    var newData = {
      label: data.name, // Toggle API exposes `label`
      isRefined: data.isRefined,
      count: data.count
    };

    return transformData && transformData(newData) || newData;
  };
}

function toggleRefinement(helper, facetName, isRefined) {
  var action = isRefined ? 'remove' : 'add';

  helper[action + 'FacetRefinement'](facetName, true).search();
}

module.exports = toggle;
