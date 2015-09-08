var React = require('react');

var utils = require('../lib/widget-utils.js');
var defaultTemplate = '<label>{{label}}<input type="checkbox" {{#isRefined}}checked{{/isRefined}} /></label>';

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
