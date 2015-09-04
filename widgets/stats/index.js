var React = require('react');

var utils = require('../../lib/widget-utils.js');
var defaultTemplate = require('./template.html');

function stats({container = null, template = defaultTemplate}) {
  var Stats = require('../../components/Stats');
  var containerNode = utils.getContainerNode(container);

  if (container === null) {
    throw new Error('Usage: stats({container})');
  }

  return {
    render: function(results) {
      React.render(
        <Stats
          nbHits={results.nbHits}
          processingTimeMS={results.processingTimeMS}
          template={template}
        />,
        containerNode
      );
    }
  };
}

module.exports = stats;
