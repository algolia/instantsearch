import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import Slider from '../../components/Slider/Slider.js';
import connectRange from '../../connectors/range/connectRange.js';
import { getContainerNode } from '../../lib/utils.js';
import { component } from '../../lib/suit';

const suit = component('RangeSlider');

const renderer = ({ containerNode, cssClasses, pips, step, tooltips }) => (
  { refine, range, start },
  isFirstRendering
) => {
  if (isFirstRendering) {
    // There's no information at this point, let's render nothing.
    return;
  }

  const { min: minRange, max: maxRange } = range;

  const [minStart, maxStart] = start;
  const minFinite = minStart === -Infinity ? minRange : minStart;
  const maxFinite = maxStart === Infinity ? maxRange : maxStart;

  // Clamp values to the range for avoid extra rendering & refinement
  // Should probably be done on the connector side, but we need to stay
  // backward compatible so we still need to pass [-Infinity, Infinity]
  const values = [
    minFinite > maxRange ? maxRange : minFinite,
    maxFinite < minRange ? minRange : maxFinite,
  ];

  render(
    <Slider
      cssClasses={cssClasses}
      refine={refine}
      min={minRange}
      max={maxRange}
      values={values}
      tooltips={tooltips}
      step={step}
      pips={pips}
    />,
    containerNode
  );
};

const usage = `Usage:
rangeSlider({
  container,
  attribute,
  [ min ],
  [ max ],
  [ pips = true ],
  [ step = 1 ],
  [ precision = 0 ],
  [ tooltips=true ],
  [ cssClasses.{root} ],
});
`;

/**
 * @typedef {Object} RangeSliderCssClasses
 * @property  {string|string[]} [root] CSS class to add to the root element.
 */

/**
 * @typedef {Object} RangeSliderTooltipOptions
 * @property {function(number):string} format The function takes the raw value as input, and should return
 * a string for the label that should be used for this value.
 * `format: function(rawValue) {return '$' + Math.round(rawValue).toLocaleString()}`
 */

/**
 * @typedef {Object} RangeSliderWidgetOptions
 * @property  {string|HTMLElement} container CSS Selector or DOMElement to insert the widget.
 * @property  {string} attribute Name of the attribute for faceting.
 * @property  {boolean|RangeSliderTooltipOptions} [tooltips=true] Should we show tooltips or not.
 * The default tooltip will show the raw value.
 * You can also provide an object with a format function as an attribute.
 * So that you can format the tooltip display value as you want
 * @property  {RangeSliderCssClasses} [cssClasses] CSS classes to add to the wrapping elements.
 * @property  {boolean} [pips=true] Show slider pips.
 * @property  {number} [precision = 0] Number of digits after decimal point to use.
 * @property  {number} [step] Every handle move will jump that number of steps.
 * @property  {number} [min] Minimal slider value, default to automatically computed from the result set.
 * @property  {number} [max] Maximal slider value, defaults to automatically computed from the result set.
 */

/**
 * The range slider is a widget which provides a user-friendly way to filter the
 * results based on a single numeric range.
 *
 * @requirements
 * The attribute passed to `attribute` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * The values inside this attribute must be JavaScript numbers (not strings).
 *
 * @type {WidgetFactory}
 * @devNovel RangeSlider
 * @category filter
 * @param {RangeSliderWidgetOptions} $0 RangeSlider widget options.
 * @return {Widget} A new RangeSlider widget instance.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.rangeSlider({
 *     container: '#price',
 *     attribute: 'price',
 *     tooltips: {
 *       format: function(rawValue) {
 *         return '$' + Math.round(rawValue).toLocaleString();
 *       }
 *     }
 *   })
 * );
 */
export default function rangeSlider({
  container,
  attribute,
  min,
  max,
  cssClasses: userCssClasses = {},
  step,
  pips = true,
  precision = 0,
  tooltips = true,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
  };

  const specializedRenderer = renderer({
    containerNode,
    step,
    pips,
    tooltips,
    renderState: {},
    cssClasses,
  });

  try {
    const makeWidget = connectRange(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget({ attribute, min, max, precision });
  } catch (e) {
    throw new Error(usage);
  }
}
