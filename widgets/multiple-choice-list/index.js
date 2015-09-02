var React = require('react');

var utils = require('../../lib/widgetUtils.js');
var defaultTemplate = require('./template.html');

function multipleChoiceList({container = null, facetName = null, template = defaultTemplate}) {
  var MultipleChoiceList = require('../../components/MultipleChoiceList');
  var containerNode = utils.getContainerNode(container);

  if (container === null || facetName === null) {
    throw new Error('Usage: multipleChoiceList({container, facetName[, template]})');
  }

  return {
    getConfiguration: () => ({disjunctiveFacets: [facetName]}),
    render: function(results, state, helper) {
      React.render(
        <MultipleChoiceList
          facetValues={results.getFacetValues(facetName, {sortBy: ['name:asc']})}
          toggleRefine={helper.toggleRefine.bind(helper, facetName)}
          template={template}
        />,
        containerNode
      );
    }
  };
}

module.exports = multipleChoiceList;
