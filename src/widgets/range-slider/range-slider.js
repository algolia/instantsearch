import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import Slider from '../../components/Slider/Slider.js';
import connectRangeSlider from '../../connectors/range-slider/connectRangeSlider.js';

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
}) => (
  { refine, range: { min, max }, start, instantSearchInstance },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const shouldAutoHideContainer = autoHideContainer && min === max;

  const minValue = start[0] === -Infinity ? min : start[0];
  const maxValue = start[1] === Infinity ? max : start[1];

  ReactDOM.render(
    <Slider
      cssClasses={cssClasses}
      refine={refine}
      min={min}
      max={max}
      values={[minValue, maxValue]}
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
  [ precision = 2 ],
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
 * @property  {number} [step=1] Every handle move will jump that number of steps.
 * @property  {boolean|RangeSliderCollapsibleOptions} [collapsible=false] Hide the widget body and footer when clicking on header.
 * @property  {number} [min] Minimal slider value, default to automatically computed from the result set.
 * @property  {number} [max] Maximal slider value, defaults to automatically computed from the result set.
 */

/**
 * The range slider is a widget which provides a user-friendly way to filter the
 * results based on a single numeric range.
 *
 * @type {WidgetFactory}
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
export default function rangeSlider(
  {
    container,
    attributeName,
    min,
    max,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
    step = 1,
    pips = true,
    precision = 2,
    tooltips = true,
    autoHideContainer = true,
  } = {}
) {
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
    cssClasses,
  });

  try {
    const makeWidget = connectRangeSlider(specializedRenderer);
    return makeWidget({ attributeName, min, max, precision });
  } catch (e) {
    throw new Error(usage);
  }
}
