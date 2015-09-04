var React = require('react');

var findIndex = require('lodash/array/findIndex');
var utils = require('../../lib/widgetUtils.js');

function indexSelector({container = null, indices = null}) {
  var IndexSelector = require('../../components/IndexSelector');
  var containerNode = utils.getContainerNode(container);

  var usage = 'Usage: indexSelector({container, indices})';
  if (container === null || indices === null) {
    throw new Error(usage);
  }

  return {
    init: function(state, helper) {
      var currentIndex = helper.getIndex();
      var isIndexInList = findIndex(indices, {'name': currentIndex}) !== -1;
      if (!isIndexInList) {
        throw new Error('[stats]: Index ' + currentIndex + ' not present in `indices`');
      }
    },
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
