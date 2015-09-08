var React = require('react');

var findIndex = require('lodash/array/findIndex');
var utils = require('../lib/widget-utils.js');

/**
 * Instantiate a dropdown element to choose the current targeted index
 * @param  {String|DOMElement} options.container Valid CSS Selector as a string or DOMElement
 * @param  {Array} options.indices Array of objects defining the different indices to choose from. Each object must contain a `name` and `label` key.
 * @param  {String} [options.cssClass] Class name(s) to be added to the generated select element
 * @return {Object}
 */
function indexSelector({
    container = null,
    cssClass = {},
    indices = null
  }) {
  var IndexSelector = require('../components/IndexSelector');
  var containerNode = utils.getContainerNode(container);

  var usage = 'Usage: indexSelector({container, indices[, cssClass]})';
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
      var containerId = containerNode.id;
      React.render(
        <IndexSelector
          containerId={containerId}
          cssClass={cssClass}
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
