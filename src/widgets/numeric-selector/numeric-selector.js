import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import Selector from '../../components/Selector';
import connectNumericSelector from '../../connectors/numeric-selector/connectNumericSelector';

import { bemHelper, getContainerNode } from '../../lib/utils';

const bem = bemHelper('ais-numeric-selector');

const renderer = ({ containerNode, autoHideContainer, cssClasses }) => (
  { currentRefinement, refine, hasNoResults, options },
  isFirstRendering
) => {
  if (isFirstRendering) return;

  render(
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
  cssClasses.{root,select,item},
  autoHideContainer
})`;

/**
 * @typedef {Object} NumericOption
 * @property {number} value The numerical value to refine with.
 * If the value is `undefined` or `"undefined"`, the option resets the filter.
 * @property {string} label Label to display in the option.
 */

/**
 * @typedef {Object} NumericSelectorCSSClasses
 * @property {string|string[]} [root] CSS classes added to the outer `<div>`.
 * @property {string|string[]} [select] CSS classes added to the parent `<select>`.
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
 * This widget lets the user choose between numerical refinements from a dropdown menu.
 *
 * @requirements
 * The attribute passed to `attributeName` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * The values inside this attribute must be JavaScript numbers and not strings.
 * @type {WidgetFactory}
 * @devNovel NumericSelector
 * @category filter
 * @param {NumericSelectorWidgetOptions} $0 The NumericSelector widget options.
 * @return {Widget} A new instance of NumericSelector widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.numericSelector({
 *     container: '#rating-selector',
 *     attributeName: 'rating',
 *     operator: '=',
 *     options: [
 *       {label: 'All products'},
 *       {label: 'Only 5 star products', value: 5},
 *       {label: 'Only 4 star products', value: 4},
 *       {label: 'Only 3 star products', value: 3},
 *       {label: 'Only 2 star products', value: 2},
 *       {label: 'Only 1 star products', value: 1},
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
    // We use the same class to avoid regression on existing website. It needs to be replaced
    // eventually by `bem('select')
    select: cx(bem(null), userCssClasses.select),
    item: cx(bem('item'), userCssClasses.item),
  };

  const specializedRenderer = renderer({
    autoHideContainer,
    containerNode,
    cssClasses,
  });

  try {
    const makeNumericSelector = connectNumericSelector(
      specializedRenderer,
      () => unmountComponentAtNode(containerNode)
    );
    return makeNumericSelector({ operator, attributeName, options });
  } catch (e) {
    throw new Error(usage);
  }
}
