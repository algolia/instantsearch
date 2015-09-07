var React = require('react');

var utils = require('../lib/widget-utils.js');

function toggle({
    container = null,
    facetName = null,
    label = null
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
          toggleFilter={toggleFilter}
          label={label}
        />,
        containerNode
      );
    }
  };
}

module.exports = toggle;
