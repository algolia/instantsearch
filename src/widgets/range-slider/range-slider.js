import React from 'react';
import ReactDOM from 'react-dom';
import Slider from '../../components/Slider/Slider.js';
import connectRangeSlider from '../../connectors/range-slider/connectRangeSlider.js';

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
 * @return {Object}
 */

export default connectRangeSlider(defaultRendering);
function defaultRendering({
  collapsible,
  cssClasses,
  refine,
  pips,
  range,
  shouldAutoHideContainer,
  start,
  step,
  templateProps,
  tooltips,
  format,
  containerNode,
}, isFirstRendering) {
  if (isFirstRendering) return;
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
      templateProps={templateProps}
      tooltips={tooltips}
      format={format}
    />,
    containerNode
  );
}
