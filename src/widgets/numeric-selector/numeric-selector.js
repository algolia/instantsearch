import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import Selector from '../../components/Selector.js';
import connectNumericSelector from '../../connectors/numeric-selector/connectNumericSelector.js';

import {
  bemHelper,
  getContainerNode,
} from '../../lib/utils.js';

const bem = bemHelper('ais-numeric-selector');

const renderer = ({
  containerNode,
  autoHideContainer,
  cssClasses,
}) => ({
  currentValue,
  setValue,
  hasNoResults,
  options,
}, isFirstRendering) => {
  if (isFirstRendering) return;

  ReactDOM.render(
    <Selector
      cssClasses={cssClasses}
      currentValue={currentValue}
      options={options}
      setValue={setValue}
      shouldAutoHideContainer={autoHideContainer && hasNoResults}
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
 * @param  {string|DOMElement} $0.container CSS Selector or DOMElement to insert the widget
 * @param  {string} $0.attributeName Name of the numeric attribute to use
 * @param  {Array} $0.options Array of objects defining the different values and labels
 * @param  {number} $0.options[i].value The numerical value to refine with
 * @param  {string} $0.options[i].label Label to display in the option
 * @param  {string} [$0.operator='='] The operator to use to refine
 * @param  {boolean} [$0.autoHideContainer=false] Hide the container when no results match
 * @param  {Object} [$0.cssClasses] CSS classes to be added
 * @param  {string|string[]} [$0.cssClasses.root] CSS classes added to the parent `<select>`
 * @param  {string|string[]} [$0.cssClasses.item] CSS classes added to each `<option>`
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

  try {
    const makeNumericSelector = connectNumericSelector(specializedRenderer);
    return makeNumericSelector({operator, attributeName, options});
  } catch (e) {
    throw new Error(usage);
  }
}
