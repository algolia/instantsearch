/** @jsx h */

import { connectRange } from 'instantsearch-core';
import { createDocumentationMessageGenerator } from 'instantsearch-core/internal';
import { createRangeInputComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import { prepareTemplateProps, renderTemplate } from '../../lib/templating';
import { getContainerNode } from '../../lib/utils';

import type { PreparedTemplateProps } from '../../lib/templating';
import type { Template } from '../../types';
import type {
  RangeConnectorParams,
  RangeRenderState,
  RangeWidgetDescription,
} from 'instantsearch-core';
import type { Renderer, WidgetFactory } from 'instantsearch-core';
import type { RangeInputClassNames } from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({ name: 'range-input' });
const RangeInput = createRangeInputComponent({
  createElement: h,
  Fragment,
});

const defaultTemplates: Required<RangeInputTemplates> = {
  separatorText() {
    return 'to';
  },
  submitText() {
    return 'Go';
  },
};

export type RangeInputTemplates = Partial<{
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
}>;

export type RangeInputCSSClasses = Partial<{
  /**
   * CSS class to add to the root element.
   */
  root: string | string[];
  /**
   * CSS class to add to the root element when the range can't be refined.
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
  inputMax: string | string[];
  /**
   * CSS class to add to the separator of the form.
   */
  separator: string | string[];
  /**
   * CSS class to add to the submit button of the form.
   */
  submit: string | string[];
}>;

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
  templates?: RangeInputTemplates;
  /**
   * CSS classes to add.
   */
  cssClasses?: RangeInputCSSClasses;
};

const renderer = ({
  containerNode,
  classNames,
  templateProps,
}: {
  containerNode: HTMLElement;
  classNames: Partial<RangeInputClassNames>;
  templateProps: PreparedTemplateProps<Required<RangeInputTemplates>>;
}): Renderer<RangeRenderState, Partial<RangeInputWidgetParams>> => {
  // Created once per widget instance so Preact doesn't remount the template
  // subtrees on every render. The separator and submit elements used to be
  // the `Template`'s root: returning `null` from the template removed them
  // from the DOM, which the factory keeps by omitting them on `null`.
  const createTemplateComponent =
    (templateKey: keyof RangeInputTemplates) => () => {
      const content = renderTemplate({
        templates: templateProps.templates,
        templateKey,
      });

      if (content === null) {
        return null;
      }

      // An empty string renders an empty element rather than an empty text node
      return <Fragment>{content === '' ? null : content}</Fragment>;
    };
  const separatorTextComponent = createTemplateComponent('separatorText');
  const submitTextComponent = createTemplateComponent('submitText');

  // The widget owns the typed values: they reset to the current refinement on
  // every render coming from the connector, and update on input.
  let values = { from: '', to: '' };
  let renderState: RangeRenderState & {
    widgetParams: Partial<RangeInputWidgetParams>;
  };

  const renderComponent = () => {
    const { refine, range, canRefine, widgetParams } = renderState;
    const step = 1 / Math.pow(10, widgetParams.precision || 0);

    render(
      <RangeInput
        classNames={classNames}
        min={range.min}
        max={range.max}
        step={step}
        fromValue={values.from}
        toValue={values.to}
        canRefine={canRefine}
        onFromChange={(from) => {
          values = { ...values, from };
          renderComponent();
        }}
        onToChange={(to) => {
          values = { ...values, to };
          renderComponent();
        }}
        onSubmit={() => {
          refine({
            min: values.from ? Number(values.from) : undefined,
            max: values.to ? Number(values.to) : undefined,
          });
        }}
        separatorTextComponent={separatorTextComponent}
        submitTextComponent={submitTextComponent}
      />,
      containerNode
    );
  };

  return (renderOptions, isFirstRendering) => {
    if (isFirstRendering) {
      return;
    }

    const { currentRefinement } = renderOptions;
    renderState = renderOptions;
    values = {
      from: currentRefinement.min?.toString() ?? '',
      to: currentRefinement.max?.toString() ?? '',
    };

    renderComponent();
  };
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
    templates = {},
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const classNames: Partial<RangeInputClassNames> = {
    root: userCssClasses.root,
    noRefinementRoot: userCssClasses.noRefinement,
    form: userCssClasses.form,
    label: userCssClasses.label,
    input: userCssClasses.input,
    inputMin: userCssClasses.inputMin,
    inputMax: userCssClasses.inputMax,
    separator: userCssClasses.separator,
    submit: userCssClasses.submit,
  };

  const templateProps = prepareTemplateProps({
    defaultTemplates,
    templates,
  });

  const specializedRenderer = renderer({
    containerNode,
    classNames,
    templateProps,
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
