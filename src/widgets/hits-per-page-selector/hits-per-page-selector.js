import React from 'react';
import ReactDOM from 'react-dom';

import Selector from '../../components/Selector.js';

import connectHitsPerPageSelector from '../../connectors/hits-per-page-selector/connectHitsPerPageSelector.js';

/**
 * Instantiate a dropdown element to choose the number of hits to display per page
 * @function hitsPerPageSelector
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Array} options.options Array of objects defining the different values and labels
 * @param  {number} options.options[0].value number of hits to display per page
 * @param  {string} options.options[0].label Label to display in the option
 * @param  {boolean} [options.autoHideContainer=false] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS classes added to the parent `<select>`
 * @param  {string|string[]} [options.cssClasses.item] CSS classes added to each `<option>`
 * @return {Object}
 */

export default connectHitsPerPageSelector(defaultRendering);

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
