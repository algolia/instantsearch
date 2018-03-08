import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import Slider from '../../components/Slider/Slider.js';
import connectRange from '../../connectors/range/connectRange.js';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils.js';

const defaultTemplates = {
  header: '',
  footer: '',
};

const bem = bemHelper('ais-range-slider');

const renderer = ({
  containerNode,
  cssClasses,
  pips,
  step,
  tooltips,
  autoHideContainer,
  collapsible,
  renderState,
  templates,
}) => ({ refine, range, start, instantSearchInstance }, isFirstRendering) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const { min: minRange, max: maxRange } = range;
  const shouldAutoHideContainer = autoHideContainer && minRange === maxRange;

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
      shouldAutoHideContainer={shouldAutoHideContainer}
      collapsible={collapsible}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
rangeSlider({
  container,
  attributeName,
  [ min ],
  [ max ],
  [ pips = true ],
  [ step = 1 ],
  [ precision = 0 ],
  [ tooltips=true ],
  [ templates.{header, footer} ],
  [ cssClasses.{root, header, body, footer} ],
  [ autoHideContainer=true ],
  [ collapsible=false ],
});
`;

/**
 * @typedef {Object} RangeSliderTemplates
 * @property  {string|function} [header=""] Header template.
 * @property  {string|function} [footer=""] Footer template.
 */

/**
 * @typedef {Object} RangeSliderCssClasses
 * @property  {string|string[]} [root] CSS class to add to the root element.
 * @property  {string|string[]} [header] CSS class to add to the header element.
 * @property  {string|string[]} [body] CSS class to add to the body element.
 * @property  {string|string[]} [footer] CSS class to add to the footer element.
 */

/**
 * @typedef {Object} RangeSliderTooltipOptions
 * @property {function(number):string} format The function takes the raw value as input, and should return
 * a string for the label that should be used for this value.
 * `format: function(rawValue) {return '$' + Math.round(rawValue).toLocaleString()}`
 */

/**
 * @typedef {Object} RangeSliderCollapsibleOptions
 * @property  {boolean} [collapsed] Initially collapsed state of a collapsible widget.
 */

/**
 * @typedef {Object} RangeSliderWidgetOptions
 * @property  {string|HTMLElement} container CSS Selector or DOMElement to insert the widget.
 * @property  {string} attributeName Name of the attribute for faceting.
 * @property  {boolean|RangeSliderTooltipOptions} [tooltips=true] Should we show tooltips or not.
 * The default tooltip will show the raw value.
 * You can also provide an object with a format function as an attribute.
 * So that you can format the tooltip display value as you want
 * @property  {RangeSliderTemplates} [templates] Templates to use for the widget.
 * @property  {boolean} [autoHideContainer=true] Hide the container when no refinements available.
 * @property  {RangeSliderCssClasses} [cssClasses] CSS classes to add to the wrapping elements.
 * @property  {boolean} [pips=true] Show slider pips.
 * @property  {number} [precision = 0] Number of digits after decimal point to use.
 * @property  {boolean|RangeSliderCollapsibleOptions} [collapsible=false] Hide the widget body and footer when clicking on header.
 * @property  {number} [step] Every handle move will jump that number of steps.
 * @property  {number} [min] Minimal slider value, default to automatically computed from the result set.
 * @property  {number} [max] Maximal slider value, defaults to automatically computed from the result set.
 */

/**
 * The range slider is a widget which provides a user-friendly way to filter the
 * results based on a single numeric range.
 *
 * @requirements
 * The attribute passed to `attributeName` must be declared as an
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
 *     attributeName: 'price',
 *     templates: {
 *       header: 'Price'
 *     },
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
  attributeName,
  min,
  max,
  templates = defaultTemplates,
  cssClasses: userCssClasses = {},
  step,
  pips = true,
  precision = 0,
  tooltips = true,
  autoHideContainer = true,
  collapsible = false,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
  };

  const specializedRenderer = renderer({
    containerNode,
    step,
    pips,
    tooltips,
    renderState: {},
    templates,
    autoHideContainer,
    collapsible,
    cssClasses,
  });

  try {
    const makeWidget = connectRange(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget({ attributeName, min, max, precision });
  } catch (e) {
    throw new Error(usage);
  }
}
