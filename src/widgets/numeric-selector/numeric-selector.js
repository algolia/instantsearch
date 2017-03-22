import React from 'react';
import ReactDOM from 'react-dom';
import Selector from '../../components/Selector.js';
import connectNumericSelector from '../../connectors/numeric-selector/connectNumericSelector.js';

import {
  bemHelper,
  getContainerNode,
} from '../../lib/utils.js';
import cx from 'classnames';

const bem = bemHelper('ais-numeric-selector');

const renderer = ({
  containerNode,
  autoHideContainer,
  cssClasses,
}) => ({
  currentValue,
  setValue,
  noResults,
  options,
}, isFirstRendering) => {
  if (isFirstRendering) return;

  ReactDOM.render(
    <Selector
      cssClasses={cssClasses}
      currentValue={currentValue}
      options={options}
      setValue={setValue}
      shouldAutoHideContainer={autoHideContainer && noResults}
    />,
    containerNode
  );
};

const usage = `Usage: numericSelector({
  container,
  attributeName,
  options,
  cssClasses.{root,item},
  autoHideContainer
})`;

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
 * @return {Object} a numeric selector widget instance
 */
export default function numericSelector({
  container,
  operator = '=',
  attributeName,
  options,
  cssClasses: userCssClasses = {},
  autoHideContainer = false,
}) {
  const containerNode = getContainerNode(container);
  if (!container || !options || options.length === 0 || !attributeName) {
    throw new Error(usage);
  }

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item),
  };

  const specializedRenderer = renderer({autoHideContainer, containerNode, cssClasses});
  const makeNumericSelector = connectNumericSelector(specializedRenderer);

  return makeNumericSelector({
    operator,
    attributeName,
    options,
  });
}
