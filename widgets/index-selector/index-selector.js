let React = require('react');
let ReactDOM = require('react-dom');

let findIndex = require('lodash/array/findIndex');
let map = require('lodash/collection/map');
let utils = require('../../lib/utils.js');
let bem = utils.bemHelper('ais-index-selector');
let cx = require('classnames');
let autoHideContainer = require('../../decorators/autoHideContainer');

/**
 * Instantiate a dropdown element to choose the current targeted index
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.indices Array of objects defining the different indices to choose from.
 * @param  {string} options.indices[0].name Name of the index to target
 * @param  {string} options.indices[0].label Label displayed in the dropdown
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string} [options.cssClasses.root] CSS classes added to the parent <select>
 * @param  {string} [options.cssClasses.item] CSS classes added to each <option>
 * @param  {boolean} [hideContainerWhenNoResults=false] Hide the container when no results match
 * @return {Object}
 */
function indexSelector({
    container,
    indices,
    cssClasses: userCssClasses = {},
    hideContainerWhenNoResults = false
  }) {
  let containerNode = utils.getContainerNode(container);
  let usage = 'Usage: indexSelector({container, indices[, cssClasses.{root,item}, hideContainerWhenNoResults]})';

  let Selector = require('../../components/Selector');
  if (hideContainerWhenNoResults === true) {
    Selector = autoHideContainer(Selector);
  }

  if (!container || !indices) {
    throw new Error(usage);
  }

  let selectorOptions = map(indices, function(index) {
    return {label: index.label, value: index.name};
  });

  return {
    init: function(state, helper) {
      let currentIndex = helper.getIndex();
      let isIndexInList = findIndex(indices, {name: currentIndex}) !== -1;
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
      let hasNoResults = results.nbHits === 0;
      let setIndex = this.setIndex.bind(this, helper);

      let cssClasses = {
        root: cx(bem(null), userCssClasses.root),
        item: cx(bem('item'), userCssClasses.item)
      };
      ReactDOM.render(
        <Selector
          cssClasses={cssClasses}
          currentValue={currentIndex}
          options={selectorOptions}
          setValue={setIndex}
          shouldAutoHideContainer={hasNoResults}
        />,
        containerNode
      );
    }
  };
}

module.exports = indexSelector;
