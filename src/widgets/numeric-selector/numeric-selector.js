import React from 'react';
import ReactDOM from 'react-dom';
import Selector from '../../components/Selector.js';
import connectNumericSelector from '../../connectors/numeric-selector/connectNumericSelector.js';

/**
 * Instantiate a dropdown element to choose the number of hits to display per page
 * @function numericSelector
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the numeric attribute to use
 * @param  {Array} options.options Array of objects defining the different values and labels
 * @param  {number} options.options[i].value The numerical value to refine with
 * @param  {string} options.options[i].label Label to display in the option
 * @param  {string} [options.operator='='] The operator to use to refine
 * @param  {boolean} [options.autoHideContainer=false] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS classes added to the parent `<select>`
 * @param  {string|string[]} [options.cssClasses.item] CSS classes added to each `<option>`
 * @return {Object}
 */
export default connectNumericSelector(defaultRendering);

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
