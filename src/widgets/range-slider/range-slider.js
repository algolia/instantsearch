import React, { render } from 'preact-compat';
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

const renderer = (
  { refine, range, start, instantSearchInstance, widgetParams },
  isFirstRendering
) => {
  const {
    container,
    cssClasses,
    pips,
    step,
    tooltips,
    autoHideContainer,
    collapsible,
    renderState,
    templates,
  } = widgetParams;

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
    getContainerNode(container)
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
 * @requirements
 * The attribute passed to `attributeName` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * The values inside this attribute must be JavaScript numbers (not strings).
 *
 * @type {WidgetFactory}
 * @category filter
 * @param {RangeSliderWidgetOptions} params RangeSlider widget options.
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
export default function rangeSlider(params = {}) {
  const widgetParams = {
    container: '',
    step: 1,
    pips: true,
    tooltips: true,
    autoHideContainer: true,
    cssClasses: {},
    templates: defaultTemplates,
    ...params,
  };

  if (!widgetParams.container) {
    throw new Error(usage);
  }

  try {
    const makeWidget = connectRangeSlider(renderer);

    return makeWidget({
      ...widgetParams,
      renderState: {},
      cssClasses: {
        root: cx(bem(null), widgetParams.cssClasses.root),
        header: cx(bem('header'), widgetParams.cssClasses.header),
        body: cx(bem('body'), widgetParams.cssClasses.body),
        footer: cx(bem('footer'), widgetParams.cssClasses.footer),
      },
    });
  } catch (e) {
    throw new Error(usage);
  }
}
