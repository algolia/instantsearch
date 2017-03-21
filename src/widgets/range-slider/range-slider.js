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
  tooltips,
  renderState,
  autoHideContainer,
  pips,
  step,
  collapsible,
  templates,
}) => ({
  refine,
  range,
  start,
  instantSearchInstance,
  format,
}, isFirstRendering) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const shouldAutoHideContainer = autoHideContainer && range.min === range.max;

  if (tooltips.format !== undefined) {
    tooltips = [{to: tooltips.format}, {to: tooltips.format}];
  }

  ReactDOM.render(
    <Slider
      collapsible={collapsible}
      cssClasses={cssClasses}
      onChange={refine}
      pips={pips}
      range={range}
      shouldAutoHideContainer={shouldAutoHideContainer}
      start={start}
      step={step}
      templateProps={renderState.templateProps}
      tooltips={tooltips}
      format={format}
    />,
    containerNode
  );
};

const usage = `Usage:
rangeSlider({
  container,
  attributeName,
  [ tooltips=true ],
  [ templates.{header, footer} ],
  [ cssClasses.{root, header, body, footer} ],
  [ step=1 ],
  [ pips=true ],
  [ autoHideContainer=true ],
  [ collapsible=false ],
  [ min ],
  [ max ]
});
`;

/**
 * Instantiate a slider based on a numeric attribute.
 * This is a wrapper around [noUiSlider](http://refreshless.com/nouislider/)
 * @function rangeSlider
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for faceting
 * @param  {boolean|Object} [options.tooltips=true] Should we show tooltips or not.
 * The default tooltip will show the raw value.
 * You can also provide
 * `tooltips: {format: function(rawValue) {return '$' + Math.round(rawValue).toLocaleString()}}`
 * So that you can format the tooltip display value as you want
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no refinements available
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {boolean|object} [options.pips=true] Show slider pips.
 * @param  {boolean|object} [options.step=1] Every handle move will jump that number of steps.
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @param  {number} [options.min] Minimal slider value, default to automatically computed from the result set
 * @param  {number} [options.max] Maximal slider value, defaults to automatically computed from the result set
 * @return {Object} widget
 */
export default function rangeSlider({
  container,
  attributeName,
  tooltips = true,
  templates = defaultTemplates,
  collapsible = false,
  cssClasses: userCssClasses = {},
  step = 1,
  pips = true,
  autoHideContainer = true,
  min,
  max,
  precision = 2,
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
    cssClasses,
    tooltips,
    templates,
    renderState: {},
    collapsible,
    step,
    pips,
    autoHideContainer,
  });

  try {
    const makeWidget = connectRangeSlider(specializedRenderer);
    return makeWidget({attributeName, min, max, precision});
  } catch (e) {
    throw new Error(usage);
  }
}
