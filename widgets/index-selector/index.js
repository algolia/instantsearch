var React = require('react');

var utils = require('../../lib/widgetUtils.js');

function indexSelector({container = null, indices = null}) {
  var IndexSelector = require('../../components/IndexSelector');
  var containerNode = utils.getContainerNode(container);

  var usage = 'Usage: indexSelector({container, indices})';
  if (container === null || indices === null) {
    throw new Error(usage);
  }

  return {
    render: function(results, state, helper) {
      React.render(
        <IndexSelector
          currentIndex={helper.getIndex()}
          indices={indices}
          setIndex={helper.setIndex.bind(helper)}
        />,
        containerNode
      );
    }
  };
}

module.exports = indexSelector;
