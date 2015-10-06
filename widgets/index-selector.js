var React = require('react');

var findIndex = require('lodash/array/findIndex');
var utils = require('../lib/utils.js');
var autoHide = require('../decorators/autoHide');
var IndexSelector = autoHide(require('../components/IndexSelector'));

/**
 * Instantiate a dropdown element to choose the current targeted index
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.indices Array of objects defining the different indices to choose from.
 * @param  {String} options.indices[0].name Name of the index to target
 * @param  {String} options.indices[0].label Label displayed in the dropdown
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {String} [options.cssClasses.select] CSS classes added to the parent <select>
 * @param  {String} [options.cssClasses.option] CSS classes added to each <option>
 * @param  {boolean} [hideWhenNoResults=false] Hide the container when no results match
 * @return {Object}
 */
function indexSelector({
    container,
    indices,
    cssClasses = {},
    hideWhenNoResults = false
  }) {
  var containerNode = utils.getContainerNode(container);

  var usage = 'Usage: indexSelector({container, indices[, cssClasses.{select,option}, hideWhenNoResults]})';
  if (!container || !indices) {
    throw new Error(usage);
  }

  return {
    init: function(state, helper) {
      var currentIndex = helper.getIndex();
      var isIndexInList = findIndex(indices, {name: currentIndex}) !== -1;
      if (!isIndexInList) {
        throw new Error('[stats]: Index ' + currentIndex + ' not present in `indices`');
      }
    },

    setIndex: function(helper, indexName) {
      helper.setIndex(indexName).search();
    },

    render: function({helper, results}) {
      let currentIndex = helper.getIndex();
      let hasResults = results.hits.length > 0;
      let setIndex = this.setIndex.bind(this, helper);
      React.render(
        <IndexSelector
          cssClasses={cssClasses}
          currentIndex={currentIndex}
          hasResults={hasResults}
          hideWhenNoResults={hideWhenNoResults}
          indices={indices}
          setIndex={setIndex}
        />,
        containerNode
      );
    }
  };
}

module.exports = indexSelector;
