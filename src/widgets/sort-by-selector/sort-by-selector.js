import React from 'react';
import ReactDOM from 'react-dom';

import Selector from '../../components/Selector.js';
import connectSortBySelector from '../../connectors/sort-by-selector/connectSortBySelector.js';

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

export default connectSortBySelector(defaultRendering);
function defaultRendering({
  cssClasses,
  currentValue,
  options,
  setValue,
  shouldAutoHideContainer,
  containerNode,
}, isFirstRendering) {
  if (isFirstRendering) return;
  ReactDOM.render(
    <Selector
      cssClasses={cssClasses}
      currentValue={currentValue}
      options={options}
      setValue={setValue}
      shouldAutoHideContainer={shouldAutoHideContainer}
    />,
    containerNode
  );
}
