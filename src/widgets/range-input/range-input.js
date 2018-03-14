import React, { render } from 'preact-compat';
import cx from 'classnames';
import RangeInput from '../../components/RangeInput/RangeInput.js';
import connectRange from '../../connectors/range/connectRange.js';
import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils.js';
import defaultTemplates from './defaultTemplates.js';

const bem = bemHelper('ais-range-input');

const renderer = ({
  containerNode,
  templates,
  cssClasses,
  labels,
  autoHideContainer,
  collapsible,
  renderState,
}) => (
  { refine, range, start, widgetParams, instantSearchInstance },
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

  const { min: rangeMin, max: rangeMax } = range;
  const [minValue, maxValue] = start;

  const step = 1 / Math.pow(10, widgetParams.precision);
  const shouldAutoHideContainer = autoHideContainer && rangeMin === rangeMax;

  const values = {
    min: minValue !== -Infinity && minValue !== rangeMin ? minValue : undefined,
    max: maxValue !== Infinity && maxValue !== rangeMax ? maxValue : undefined,
  };

  render(
    <RangeInput
      min={rangeMin}
      max={rangeMax}
      step={step}
      values={values}
      cssClasses={cssClasses}
      labels={labels}
      refine={refine}
      shouldAutoHideContainer={shouldAutoHideContainer}
      collapsible={collapsible}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
rangeInput({
  container,
  attributeName,
  [ min ],
  [ max ],
  [ precision = 0 ],
  [ cssClasses.{root, header, body, form, fieldset, labelMin, inputMin, separator, labelMax, inputMax, submit, footer} ],
  [ templates.{header, footer} ],
  [ labels.{separator, button} ],
  [ autoHideContainer=true ],
  [ collapsible=false ]
})`;

/**
 * @typedef {Object} RangeInputClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [header] CSS class to add to the header element.
 * @property {string|string[]} [body] CSS class to add to the body element.
 * @property {string|string[]} [form] CSS class to add to the form element.
 * @property {string|string[]} [fieldset] CSS class to add to the fieldset element.
 * @property {string|string[]} [labelMin] CSS class to add to the min label element.
 * @property {string|string[]} [inputMin] CSS class to add to the min input element.
 * @property {string|string[]} [separator] CSS class to add to the separator of the form.
 * @property {string|string[]} [labelMax] CSS class to add to the max label element.
 * @property {string|string[]} [inputMax] CSS class to add to the max input element.
 * @property {string|string[]} [submit] CSS class to add to the submit button of the form.
 * @property {string|string[]} [footer] CSS class to add to the footer element.
 */

/**
 * @typedef {Object} RangeInputTemplates
 * @property {string|function} [header=""] Header template.
 * @property {string|function} [footer=""] Footer template.
 */

/**
 * @typedef {Object} RangeInputLabels
 * @property {string} [separator="to"] Separator label, between min and max.
 * @property {string} [submit="Go"] Button label.
 */

/**
 * @typedef {Object} RangeInputWidgetOptions
 * @property {string|HTMLElement} container Valid CSS Selector as a string or DOMElement.
 * @property {string} attributeName Name of the attribute for faceting.
 * @property {number} [min] Minimal slider value, default to automatically computed from the result set.
 * @property {number} [max] Maximal slider value, defaults to automatically computed from the result set.
 * @property {number} [precision = 0] Number of digits after decimal point to use.
 * @property {RangeInputClasses} [cssClasses] CSS classes to add.
 * @property {RangeInputTemplates} [templates] Templates to use for the widget.
 * @property {RangeInputLabels} [labels] Labels to use for the widget.
 * @property {boolean} [autoHideContainer=true] Hide the container when no refinements available.
 * @property {boolean} [collapsible=false] Hide the widget body and footer when clicking on header.
 */

/**
 * The range input widget allows a user to select a numeric range using a minimum and maximum input.
 *
 * @requirements
 * The attribute passed to `attributeName` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * The values inside this attribute must be JavaScript numbers (not strings).
 * @type {WidgetFactory}
 * @devNovel RangeInput
 * @category filter
 * @param {RangeInputWidgetOptions} $0 The RangeInput widget options.
 * @return {Widget} A new instance of RangeInput widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.rangeInput({
 *     container: '#range-input',
 *     attributeName: 'price',
 *     labels: {
 *       separator: 'to',
 *       button: 'Go'
 *     },
 *     templates: {
 *       header: 'Price'
 *     }
 *   })
 * );
 */
export default function rangeInput({
  container,
  attributeName,
  min,
  max,
  precision = 0,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  labels: userLabels = {},
  autoHideContainer = true,
  collapsible = false,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const labels = {
    separator: 'to',
    submit: 'Go',
    ...userLabels,
  };

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    form: cx(bem('form'), userCssClasses.form),
    fieldset: cx(bem('fieldset'), userCssClasses.fieldset),
    labelMin: cx(bem('labelMin'), userCssClasses.labelMin),
    inputMin: cx(bem('inputMin'), userCssClasses.inputMin),
    separator: cx(bem('separator'), userCssClasses.separator),
    labelMax: cx(bem('labelMax'), userCssClasses.labelMax),
    inputMax: cx(bem('inputMax'), userCssClasses.inputMax),
    submit: cx(bem('submit'), userCssClasses.submit),
    footer: cx(bem('footer'), userCssClasses.footer),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    templates,
    labels,
    autoHideContainer,
    collapsible,
    renderState: {},
  });

  try {
    const makeWidget = connectRange(specializedRenderer);

    return makeWidget({
      attributeName,
      min,
      max,
      precision,
    });
  } catch (e) {
    throw new Error(usage);
  }
}
