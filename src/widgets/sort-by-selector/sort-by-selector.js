import React from 'react';
import ReactDOM from 'react-dom';

import findIndex from 'lodash/array/findIndex';
import map from 'lodash/collection/map';
import utils from '../../lib/utils.js';
let bem = utils.bemHelper('ais-sort-by-selector');
import cx from 'classnames';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';

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

  let containerNode = utils.getContainerNode(container);
  let Selector = require('../../components/Selector.js');
  if (autoHideContainer === true) {
    Selector = autoHideContainerHOC(Selector);
  }

  let selectorOptions = map(indices, function(index) {
    return {label: index.label, value: index.name};
  });

  return {
    init: function({helper}) {
      let currentIndex = helper.getIndex();
      let isIndexInList = findIndex(indices, {name: currentIndex}) !== -1;
      if (!isIndexInList) {
        throw new Error('[sortBySelector]: Index ' + currentIndex + ' not present in `indices`');
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

export default sortBySelector;
