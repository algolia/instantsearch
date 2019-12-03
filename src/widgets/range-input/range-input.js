/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import RangeInput from '../../components/RangeInput/RangeInput';
import connectRange from '../../connectors/range/connectRange';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';

const withUsage = createDocumentationMessageGenerator({ name: 'range-input' });
const suit = component('RangeInput');

const renderer = ({ containerNode, cssClasses, renderState, templates }) => (
  { refine, range, start, widgetParams, instantSearchInstance },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
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
      refine={refine}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

/**
 * @typedef {Object} RangeInputClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [noRefinement] CSS class to add to the root element when there's no refinements.
 * @property {string|string[]} [form] CSS class to add to the form element.
 * @property {string|string[]} [label] CSS class to add to the label element.
 * @property {string|string[]} [input] CSS class to add to the input element.
 * @property {string|string[]} [inputMin] CSS class to add to the min input element.
 * @property {string|string[]} [inputMax] CSS class to add to the max input element.
 * @property {string|string[]} [separator] CSS class to add to the separator of the form.
 * @property {string|string[]} [submit] CSS class to add to the submit button of the form.
 */

/**
 * @typedef {Object} RangeInputTemplates
 * @property {string} [separatorText = "to"] The label of the separator, between min and max.
 * @property {string} [submitText = "Go"] The label of the submit button.
 */

/**
 * @typedef {Object} RangeInputWidgetOptions
 * @property {string|HTMLElement} container Valid CSS Selector as a string or DOMElement.
 * @property {string} attribute Name of the attribute for faceting.
 * @property {number} [min] Minimal slider value, default to automatically computed from the result set.
 * @property {number} [max] Maximal slider value, defaults to automatically computed from the result set.
 * @property {number} [precision = 0] Number of digits after decimal point to use.
 * @property {RangeInputTemplates} [templates] Labels to use for the widget.
 * @property {RangeInputClasses} [cssClasses] CSS classes to add.
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
 * search.addWidgets([
 *   instantsearch.widgets.rangeInput({
 *     container: '#range-input',
 *     attribute: 'price',
 *     templates: {
 *       separatorText: 'to',
 *       submitText: 'Go'
 *     },
 *   })
 * ]);
 */
export default function rangeInput({
  container,
  attribute,
  min,
  max,
  precision = 0,
  cssClasses: userCssClasses = {},
  templates: userTemplates = {},
} = {}) {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const templates = {
    separatorText: 'to',
    submitText: 'Go',
    ...userTemplates,
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
    templates,
    renderState: {},
  });

  const makeWidget = connectRange(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      attribute,
      min,
      max,
      precision,
    }),

    $$type: 'ais.rangeInput',
  };
}
