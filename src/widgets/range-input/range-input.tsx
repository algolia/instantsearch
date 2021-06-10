/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import RangeInput from '../../components/RangeInput/RangeInput';
import connectRange, {
  RangeConnectorParams,
  RangeRenderState,
  RangeWidgetDescription,
} from '../../connectors/range/connectRange';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { Renderer, Template, WidgetFactory } from '../../types';

const withUsage = createDocumentationMessageGenerator({ name: 'range-input' });
const suit = component('RangeInput');

const defaultTemplates: RangeInputTemplates = {
  separatorText: 'to',
  submitText: 'Go',
};

export type RangeInputTemplates = {
  /**
   * The label of the separator, between min and max.
   * @default "to"
   */
  separatorText: Template;
  /**
   * The label of the submit button
   * @default "Go"
   */
  submitText: Template;
};

export type RangeInputCSSClasses = {
  /**
   * CSS class to add to the root element.
   */
  root: string | string[];
  /**
   * CSS class to add to the root element when there's no refinements.
   */
  noRefinement: string | string[];
  /**
   * CSS class to add to the form element.
   */
  form: string | string[];
  /**
   * CSS class to add to the label element.
   */
  label: string | string[];
  /**
   * CSS class to add to the input element.
   */
  input: string | string[];
  /**
   * CSS class to add to the min input element.
   */
  inputMin: string | string[];
  /**
   * CSS class to add to the max input element.
   */
  separator: string | string[];
  /**
   * CSS class to add to the separator of the form.
   */
  inputMax: string | string[];
  /**
   * CSS class to add to the submit button of the form.
   */
  submit: string | string[];
};

export type RangeInputWidgetParams = {
  /**
   * Valid CSS Selector as a string or DOMElement.
   */
  container: string | HTMLElement;
  /**
   * Name of the attribute for faceting.
   */
  attribute: string;
  /**
   * Minimal slider value, default to automatically computed from the result set.
   */
  min?: number;
  /**
   * Maximal slider value, defaults to automatically computed from the result set.
   */
  max?: number;
  /**
   * Number of digits after decimal point to use.
   * @default 0
   */
  precision?: number;
  /**
   * Labels to use for the widget.
   */
  templates?: Partial<RangeInputTemplates>;
  /**
   * CSS classes to add.
   */
  cssClasses?: Partial<RangeInputCSSClasses>;
};

const renderer = ({
  containerNode,
  cssClasses,
  renderState,
  templates,
}): Renderer<RangeRenderState, Partial<RangeInputWidgetParams>> => (
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

  const step = 1 / Math.pow(10, widgetParams.precision || 0);

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

export type RangeInputWidget = WidgetFactory<
  Omit<RangeWidgetDescription, '$$type'> & {
    $$widgetType: 'ais.rangeInput';
    $$type: 'ais.rangeInput';
  },
  RangeConnectorParams,
  RangeInputWidgetParams
>;

const rangeInput: RangeInputWidget = function rangeInput(widgetParams) {
  const {
    container,
    attribute,
    min,
    max,
    precision = 0,
    cssClasses: userCssClasses = {},
    templates: userTemplates = {},
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const templates = {
    ...defaultTemplates,
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
    $$widgetType: 'ais.rangeInput',
  };
};

export default rangeInput;
