var React = require('react');

var utils = require('../../lib/widgetUtils.js');

function hits({container=null, templates={}, hitsPerPage=20}) {
  var Hits = require('../../components/Hits');
  var containerNode = utils.getContainerNode(container);

  return {
    getConfiguration: () => ({hitsPerPage}),
    render: function(results, state, helper) {
      React.render(
        <Hits hits={results.hits}
          helper={helper}
          noResultsTemplate={templates.empty}
          hitTemplate={templates.hit} />,
        containerNode
      );
    }
  };
}

module.exports = hits;
