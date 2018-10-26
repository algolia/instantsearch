import React, { render } from 'preact-compat';
import cx from 'classnames';
import RangeInput from '../../components/RangeInput/RangeInput.js';
import connectRange from '../../connectors/range/connectRange.js';
import { getContainerNode } from '../../lib/utils.js';
import { component } from '../../lib/suit';

const suit = component('RangeInput');

const renderer = ({
  containerNode,
  cssClasses,
  labels,
  collapsible,
  renderState,
}) => ({ refine, range, start, widgetParams }, isFirstRendering) => {
  if (isFirstRendering) {
    return;
  }

  const { min: rangeMin, max: rangeMax } = range;
  const [minValue, maxValue] = start;

  const step = 1 / Math.pow(10, widgetParams.precision);

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
      collapsible={collapsible}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
rangeInput({
  container,
  attribute,
  [ min ],
  [ max ],
  [ precision = 0 ],
  [ cssClasses.{root, form, fieldset, labelMin, inputMin, separator, labelMax, inputMax, submit} ],
  [ labels.{separator, submit} ],
  [ collapsible=false ]
})`;

/**
 * @typedef {Object} RangeInputClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [form] CSS class to add to the form element.
 * @property {string|string[]} [fieldset] CSS class to add to the fieldset element.
 * @property {string|string[]} [labelMin] CSS class to add to the min label element.
 * @property {string|string[]} [inputMin] CSS class to add to the min input element.
 * @property {string|string[]} [separator] CSS class to add to the separator of the form.
 * @property {string|string[]} [labelMax] CSS class to add to the max label element.
 * @property {string|string[]} [inputMax] CSS class to add to the max input element.
 * @property {string|string[]} [submit] CSS class to add to the submit button of the form.
 */

/**
 * @typedef {Object} RangeInputLabels
 * @property {string} [separator="to"] Separator label, between min and max.
 * @property {string} [submit="Go"] Button label.
 */

/**
 * @typedef {Object} RangeInputWidgetOptions
 * @property {string|HTMLElement} container Valid CSS Selector as a string or DOMElement.
 * @property {string} attribute Name of the attribute for faceting.
 * @property {number} [min] Minimal slider value, default to automatically computed from the result set.
 * @property {number} [max] Maximal slider value, defaults to automatically computed from the result set.
 * @property {number} [precision = 0] Number of digits after decimal point to use.
 * @property {RangeInputClasses} [cssClasses] CSS classes to add.
 * @property {RangeInputLabels} [labels] Labels to use for the widget.
 * @property {boolean} [collapsible=false] Hide the widget body and footer when clicking on header.
 */

/**
 * The range input widget allows a user to select a numeric range using a minimum and maximum input.
 *
 * @requirements
 * The attribute passed to `attribute` must be declared as an
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
 *     attribute: 'price',
 *     labels: {
 *       separator: 'to',
 *       submit: 'Go'
 *     },
 *   })
 * );
 */
export default function rangeInput({
  container,
  attribute,
  min,
  max,
  precision = 0,
  cssClasses: userCssClasses = {},
  labels: userLabels = {},
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
    root: cx(suit(), userCssClasses.root),
    noRefinement: cx(suit({ modifierName: 'noRefinement' })),
    form: cx(suit({ descendantName: 'form' }), userCssClasses.form),
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    input: cx(suit({ descendantName: 'input' }), userCssClasses.input),
    inputMin: cx(
      suit({ descendantName: 'input', modifierName: 'min' }),
      userCssClasses.inputMin
    ),
    inputMax: cx(
      suit({ descendantName: 'input', modifierName: 'max' }),
      userCssClasses.inputMax
    ),
    separator: cx(
      suit({ descendantName: 'separator' }),
      userCssClasses.separator
    ),
    submit: cx(suit({ descendantName: 'submit' }), userCssClasses.submit),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    labels,
    collapsible,
    renderState: {},
  });

  try {
    const makeWidget = connectRange(specializedRenderer);

    return makeWidget({
      attribute,
      min,
      max,
      precision,
    });
  } catch (error) {
    throw new Error(usage);
  }
}
