import React from 'react';
import ReactDOM from 'react-dom';
import findIndex from 'lodash/array/findIndex';
import map from 'lodash/collection/map';
import {
  bemHelper,
  getContainerNode
} from '../../lib/utils.js';
import cx from 'classnames';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import SelectorComponent from '../../components/Selector.js';

let bem = bemHelper('ais-sort-by-selector');
/**
 * Instantiate a dropdown element to choose the current targeted index
 * @function sortBySelector
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.indices Array of objects defining the different indices to choose from.
 * @param  {string} options.indices[0].name Name of the index to target
 * @param  {string} options.indices[0].label Label displayed in the dropdown
 * @param  {boolean} [options.autoHideContainer=false] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS classes added to the parent <select>
 * @param  {string|string[]} [options.cssClasses.item] CSS classes added to each <option>
 * @return {Object}
 */
const usage = `Usage:
sortBySelector({
  container,
  indices,
  [cssClasses.{root,item}={}],
  [autoHideContainer=false]
})`;
function sortBySelector({
    container,
    indices,
    cssClasses: userCssClasses = {},
    autoHideContainer = false
  } = {}) {
  if (!container || !indices) {
    throw new Error(usage);
  }

  let containerNode = getContainerNode(container);
  let Selector = SelectorComponent;
  if (autoHideContainer === true) {
    Selector = autoHideContainerHOC(Selector);
  }

  let selectorOptions = map(indices, function(index) {
    return {label: index.label, value: index.name};
  });

  let cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item)
  };

  return {
    init: function({helper}) {
      let currentIndex = helper.getIndex();
      let isIndexInList = findIndex(indices, {name: currentIndex}) !== -1;
      if (!isIndexInList) {
        throw new Error('[sortBySelector]: Index ' + currentIndex + ' not present in `indices`');
      }
      this.setIndex = indexName => helper
        .setIndex(indexName)
        .search();
    },

    render: function({helper, results}) {
      ReactDOM.render(
        <Selector
          cssClasses={cssClasses}
          currentValue={helper.getIndex()}
          options={selectorOptions}
          setValue={this.setIndex}
          shouldAutoHideContainer={results.nbHits === 0}
        />,
        containerNode
      );
    }
  };
}

export default sortBySelector;
