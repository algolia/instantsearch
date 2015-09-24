var find = require('lodash/collection/find');
var React = require('react');

var utils = require('../lib/utils.js');

var defaultTemplates = {
  header: '',
  body: `<label>
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
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root
 * @param  {String|String[]} [options.cssClasses.root=null]
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {String|Function} [options.templates.header=''] Header template
 * @param  {String|Function} [options.templates.body='<label>{{label}}<input type="checkbox" {{#isRefined}}checked{{/isRefined}} /></label>'] Body template
 * @param  {String|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the item template
 * @param  {boolean} [hideWhenNoResults=true] Hide the container when no results match
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
    transformData = null,
    hideWhenNoResults = true
  }) {
  var RefinementList = require('../components/RefinementList');

  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: toggle({container, facetName, label[, template, transformData]})';

  if (container === null || facetName === null || label === null) {
    throw new Error(usage);
  }

  return {
    getConfiguration: () => ({
      facets: [facetName]
    }),
    render: function({helper, results}) {
      var isRefined = helper.hasRefinements(facetName);
      var values = find(results.getFacetValues(facetName), {name: isRefined.toString()});

      var facetValue = {
        name: label,
        isRefined: isRefined,
        count: values && values.count || null
      };

      var _templates = {
        header: templates.header,
        item: templates.body,
        footer: templates.footer
      };

      React.render(
        <RefinementList
          facetValues={[facetValue]}
          templates={_templates}
          cssClasses={cssClasses}
          transformData={prepareData(transformData)}
          hideWhenNoResults={hideWhenNoResults}
          hasResults={results.hits.length > 0}
          toggleRefinement={toggleRefinement.bind(null, helper, facetName, facetValue.isRefined)}
        />,
        containerNode
      );
    }
  };
}

function prepareData(transformData) {
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
