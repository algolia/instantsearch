var React = require('react');
var ReactDOM = require('react-dom');

var findIndex = require('lodash/array/findIndex');
var map = require('lodash/collection/map');
var utils = require('../../lib/utils.js');
var bem = utils.bemHelper('ais-index-selector');
var cx = require('classnames');
var autoHideContainer = require('../../decorators/autoHideContainer');

/**
 * Instantiate a dropdown element to choose the current targeted index
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.indices Array of objects defining the different indices to choose from.
 * @param  {String} options.indices[0].name Name of the index to target
 * @param  {String} options.indices[0].label Label displayed in the dropdown
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {String} [options.cssClasses.root] CSS classes added to the parent <select>
 * @param  {String} [options.cssClasses.item] CSS classes added to each <option>
 * @param  {boolean} [hideContainerWhenNoResults=false] Hide the container when no results match
 * @return {Object}
 */
function indexSelector({
    container,
    indices,
    cssClasses = {},
    hideContainerWhenNoResults = false
  }) {
  var containerNode = utils.getContainerNode(container);

  var usage = 'Usage: indexSelector({container, indices[, cssClasses.{root,item}, hideContainerWhenNoResults]})';
  if (!container || !indices) {
    throw new Error(usage);
  }

  var selectorOptions = map(indices, function(index) {
    return {label: index.label, value: index.name};
  });

  return {
    init: function(state, helper) {
      var currentIndex = helper.getIndex();
      var isIndexInList = findIndex(indices, {name: currentIndex}) !== -1;
      if (!isIndexInList) {
        throw new Error('[indexSelector]: Index ' + currentIndex + ' not present in `indices`');
      }
    },

    setIndex: function(helper, indexName) {
      helper.setIndex(indexName);
      helper.search();
    },

    render: function({helper, results}) {
      let currentIndex = helper.getIndex();
      let hasResults = results.hits.length > 0;
      let setIndex = this.setIndex.bind(this, helper);
      var Selector = autoHideContainer(require('../../components/Selector'));

      cssClasses = {
        root: cx(bem(null), cssClasses.root),
        item: cx(bem('item'), cssClasses.item)
      };
      ReactDOM.render(
        <Selector
          cssClasses={cssClasses}
          currentValue={currentIndex}
          hasResults={hasResults}
          hideContainerWhenNoResults={hideContainerWhenNoResults}
          options={selectorOptions}
          setValue={setIndex}
        />,
        containerNode
      );
    }
  };
}

module.exports = indexSelector;
