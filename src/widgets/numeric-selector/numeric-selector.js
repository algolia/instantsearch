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
  currentRefinement,
  refine,
  hasNoResults,
  options,
}, isFirstRendering) => {
  if (isFirstRendering) return;

  ReactDOM.render(
    <Selector
      cssClasses={cssClasses}
      currentValue={currentRefinement}
      options={options}
      setValue={refine}
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
 * @typedef {Object} NumericOption
 * @property {number} value The numerical value to refine with.
 * @property {string} label Label to display in the option.
 */

/**
 * @typedef {Object} NumericSelectorCSSClasses
 * @property {string|string[]} [root] CSS classes added to the parent `<select>`.
 * @property {string|string[]} [item] CSS classes added to each `<option>`.
 */

/**
 * @typedef {Object} NumericSelectorWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string} attributeName Name of the numeric attribute to use.
 * @property {NumericOption[]} options Array of objects defining the different values and labels.
 * @property {string} [operator='='] The operator to use to refine.
 * @property {boolean} [autoHideContainer=false] Hide the container when no results match.
 * @property {NumericSelectorCSSClasses} [cssClasses] CSS classes to be added.
 */

/**
 * Instantiate a dropdown element to choose the number of hits to display per page.
 * @type {WidgetFactory}
 * @param {NumericSelectorWidgetOptions} $0 The NumericSelector widget options.
 * @return {Widget} A new instance of NumericSelector widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.numericSelector({
 *     container: '#popularity-selector',
 *     attributeName: 'popularity',
 *     operator: '>=',
 *     options: [
 *       {label: 'Top 10', value: 9900},
 *       {label: 'Top 100', value: 9800},
 *       {label: 'Top 500', value: 9700}
 *     ]
 *   })
 * );
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
