var React = require('react');

var utils = require('../lib/utils.js');
var defaultTemplate = '<label>{{label}}<input type="checkbox" {{#isRefined}}checked{{/isRefined}} /></label>';

/**
 * Instantiate the toggling of a boolean facet filter on and off.
 * Note that it will not toggle between `true` and `false, but between `true`
 * and `undefined`.
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {String} options.facetName Name of the attribute for faceting (eg. "free_shipping")
 * @param  {String} options.label Human-readable name of the filter (eg. "Free Shipping")
 * @param  {String|Function} [options.template] Item template, provided with `label` and `isRefined`
 * @return {Object}
 */
function toggle({
    container = null,
    facetName = null,
    label = null,
    template = defaultTemplate
  }) {
  var Toggle = require('../components/Toggle');

  var containerNode = utils.getContainerNode(container);
  var usage = 'Usage: toggle({container, facetName, label})';

  if (container === null || facetName === null || label === null) {
    throw new Error(usage);
  }

  return {
    getConfiguration: () => ({
      facets: [facetName]
    }),
    render: function(results, state, helper) {
      var isRefined = helper.hasRefinements(facetName);

      function toggleFilter() {
        var methodToCall = isRefined ? 'removeFacetRefinement' : 'addFacetRefinement';
        helper[methodToCall](facetName, true).search();
      }

      React.render(
        <Toggle
          isRefined={isRefined}
          label={label}
          template={template}
          toggleFilter={toggleFilter}
        />,
        containerNode
      );
    }
  };
}

module.exports = toggle;
