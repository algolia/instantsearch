import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import Selector from '../../components/Selector.js';
import connectNumericSelector from '../../connectors/numeric-selector/connectNumericSelector.js';
import { getContainerNode } from '../../lib/utils.js';
import { component } from '../../lib/suit';

const suit = component('NumericSelector');

const renderer = ({ containerNode, cssClasses }) => (
  { currentRefinement, refine, options },
  isFirstRendering
) => {
  if (isFirstRendering) return;

  render(
    <div className={cssClasses.root}>
      <Selector
        cssClasses={cssClasses}
        currentValue={currentRefinement}
        options={options}
        setValue={refine}
      />
    </div>,
    containerNode
  );
};

const usage = `Usage: numericSelector({
  container,
  attribute,
  options,
  cssClasses.{root, select, option},
  transformItems
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
 * @property {string|string[]} [option] CSS classes added to each `<option>`.
 */

/**
 * @typedef {Object} NumericSelectorWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {string} attribute Name of the numeric attribute to use.
 * @property {NumericOption[]} options Array of objects defining the different values and labels.
 * @property {string} [operator='='] The operator to use to refine.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 * @property {NumericSelectorCSSClasses} [cssClasses] CSS classes to be added.
 */

/**
 * This widget lets the user choose between numerical refinements from a dropdown menu.
 *
 * @requirements
 * The attribute passed to `attribute` must be declared as an
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
 *     attribute: 'rating',
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
  attribute,
  options,
  cssClasses: userCssClasses = {},
  transformItems,
}) {
  const containerNode = getContainerNode(container);
  if (!container || !options || options.length === 0 || !attribute) {
    throw new Error(usage);
  }

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    select: cx(suit({ descendantName: 'select' }), userCssClasses.select),
    option: cx(suit({ descendantName: 'option' }), userCssClasses.option),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
  });

  try {
    const makeNumericSelector = connectNumericSelector(
      specializedRenderer,
      () => unmountComponentAtNode(containerNode)
    );
    return makeNumericSelector({
      operator,
      attribute,
      options,
      transformItems,
    });
  } catch (error) {
    throw new Error(usage);
  }
}
