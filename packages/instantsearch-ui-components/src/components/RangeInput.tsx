/** @jsx createElement */
import { cx } from '../lib';

import type { ComponentProps, Renderer } from '../types';

export type RangeInputClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the root element when there are no refinements possible
   */
  noRefinementRoot: string | string[];
  /**
   * Class names to apply to the form element
   */
  form: string | string[];
  /**
   * Class names to apply to each label element
   */
  label: string | string[];
  /**
   * Class names to apply to each input element
   */
  input: string | string[];
  /**
   * Class names to apply to the minimum input element
   */
  inputMin: string | string[];
  /**
   * Class names to apply to the maximum input element
   */
  inputMax: string | string[];
  /**
   * Class names to apply to the separator element
   */
  separator: string | string[];
  /**
   * Class names to apply to the submit button
   */
  submit: string | string[];
};

export type RangeInputTranslations = {
  /**
   * The label of the separator, between the minimum and maximum inputs
   */
  separatorElementText: string;
  /**
   * The label of the submit button
   */
  submitButtonText: string;
};

export type RangeInputProps = Omit<ComponentProps<'div'>, 'onSubmit'> & {
  classNames?: Partial<RangeInputClassNames>;
  /**
   * The lower bound of the range, used as the inputs' `min` and the minimum
   * input's placeholder
   */
  min?: number;
  /**
   * The upper bound of the range, used as the inputs' `max` and the maximum
   * input's placeholder
   */
  max?: number;
  /**
   * The step of the inputs
   * @default 1
   */
  step?: number;
  /**
   * The value of the minimum input. The flavor owns this state.
   */
  fromValue?: string;
  /**
   * The value of the maximum input. The flavor owns this state.
   */
  toValue?: string;
  /**
   * Called with the raw value when the minimum input changes
   */
  onFromChange?: (value: string) => void;
  /**
   * Called with the raw value when the maximum input changes
   */
  onToChange?: (value: string) => void;
  /**
   * Called when the form is submitted (its default action is prevented)
   */
  onSubmit?: () => void;
  /**
   * Whether the range can be refined. When it can't, the root gets the
   * `ais-RangeInput--noRefinement` modifier and the inputs and submit button
   * are disabled.
   * @default true
   */
  canRefine?: boolean;
  translations?: Partial<RangeInputTranslations>;
  /**
   * Overrides the content of the separator.
   * Returning `null` omits the `ais-RangeInput-separator` element.
   */
  separatorTextComponent?: () => JSX.Element | null;
  /**
   * Overrides the content of the submit button.
   * Returning `null` omits the `ais-RangeInput-submit` element.
   */
  submitTextComponent?: () => JSX.Element | null;
  /**
   * Content rendered in the minimum input's label, before the input
   */
  minLabelComponent?: () => JSX.Element | null;
  /**
   * Content rendered in the maximum input's label, before the input
   */
  maxLabelComponent?: () => JSX.Element | null;
};

// Strips leading `0` from a positive number value
function stripLeadingZeroFromInput(value: string): string {
  return value.replace(/^(0+)\d/, (part) => Number(part).toString());
}

export function createRangeInputComponent({ createElement }: Renderer) {
  return function RangeInput(userProps: RangeInputProps) {
    const {
      classNames = {},
      min,
      max,
      step = 1,
      fromValue = '',
      toValue = '',
      onFromChange,
      onToChange,
      onSubmit,
      canRefine = true,
      translations,
      separatorTextComponent,
      submitTextComponent,
      minLabelComponent,
      maxLabelComponent,
      ...props
    } = userProps;

    // Called rather than mounted so a `null` result can suppress the element,
    // as it did when the JS `Template` owned that markup.
    const separatorText = separatorTextComponent
      ? separatorTextComponent()
      : (translations?.separatorElementText ?? 'to');
    const submitText = submitTextComponent
      ? submitTextComponent()
      : (translations?.submitButtonText ?? 'Go');

    const disabled = !canRefine;

    return (
      <div
        {...props}
        className={cx(
          'ais-RangeInput',
          classNames.root,
          disabled &&
            cx('ais-RangeInput--noRefinement', classNames.noRefinementRoot),
          props.className
        )}
      >
        <form
          className={cx('ais-RangeInput-form', classNames.form)}
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit?.();
          }}
        >
          <label className={cx('ais-RangeInput-label', classNames.label)}>
            {minLabelComponent?.()}
            <input
              className={cx(
                'ais-RangeInput-input',
                classNames.input,
                'ais-RangeInput-input--min',
                classNames.inputMin
              )}
              type="number"
              min={min}
              max={max}
              step={step}
              value={stripLeadingZeroFromInput(fromValue)}
              placeholder={min?.toString()}
              disabled={disabled}
              onInput={(event) => {
                onFromChange?.((event.currentTarget as HTMLInputElement).value);
              }}
            />
          </label>
          {separatorText === null ? undefined : (
            <span
              className={cx('ais-RangeInput-separator', classNames.separator)}
            >
              {separatorText}
            </span>
          )}
          <label className={cx('ais-RangeInput-label', classNames.label)}>
            {maxLabelComponent?.()}
            <input
              className={cx(
                'ais-RangeInput-input',
                classNames.input,
                'ais-RangeInput-input--max',
                classNames.inputMax
              )}
              type="number"
              min={min}
              max={max}
              step={step}
              value={stripLeadingZeroFromInput(toValue)}
              placeholder={max?.toString()}
              disabled={disabled}
              onInput={(event) => {
                onToChange?.((event.currentTarget as HTMLInputElement).value);
              }}
            />
          </label>
          {submitText === null ? undefined : (
            <button
              className={cx('ais-RangeInput-submit', classNames.submit)}
              type="submit"
              disabled={disabled}
            >
              {submitText}
            </button>
          )}
        </form>
      </div>
    );
  };
}
