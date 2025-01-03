import { cx } from 'instantsearch-ui-components';
import React, { useState } from 'react';

import type { useRange } from 'react-instantsearch-core';

type RangeRenderState = ReturnType<typeof useRange>;

export type RangeInputProps = Omit<React.ComponentProps<'div'>, 'onSubmit'> &
  Pick<RangeRenderState, 'range' | 'currentRefinement'> & {
    classNames?: Partial<RangeInputClassNames>;
    disabled: boolean;
    onSubmit: RangeRenderState['refine'];
    step?: number;
    translations: RangeInputTranslations;
  };

export type RangeInputClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
  /**
   * Class names to apply to the root element when there are no refinements possible
   */
  noRefinementRoot: string;
  /**
   * Class names to apply to the form element
   */
  form: string;
  /**
   * Class names to apply to each label element
   */
  label: string;
  /**
   * Class names to apply to each input element
   */
  input: string;
  /**
   * Class names to apply to the minimum input element
   */
  inputMin: string;
  /**
   * Class names to apply to the maximum input element
   */
  inputMax: string;
  /**
   * Class names to apply to the separator element
   */
  separator: string;
  /**
   * Class names to apply to the submit button
   */
  submit: string;
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

// if the default value is undefined, React considers the component uncontrolled initially, which we don't want 0 or NaN as the default value
const unsetNumberInputValue = '';

// Strips leading `0` from a positive number value
function stripLeadingZeroFromInput(value: string): string {
  return value.replace(/^(0+)\d/, (part) => Number(part).toString());
}

export function RangeInput({
  classNames = {},
  range: { min: minRange, max: maxRange },
  currentRefinement: { min: minValue, max: maxValue },
  step = 1,
  disabled,
  onSubmit,
  translations,
  ...props
}: RangeInputProps) {
  const values = {
    min:
      typeof minValue === 'number' && minValue !== minRange
        ? minValue
        : unsetNumberInputValue,
    max:
      typeof maxValue === 'number' && maxValue !== maxRange
        ? maxValue
        : unsetNumberInputValue,
  };
  const [prevValues, setPrevValues] = useState(values);

  const [{ from, to }, setRange] = useState({
    from: values.min?.toString(),
    to: values.max?.toString(),
  });

  if (values.min !== prevValues.min || values.max !== prevValues.max) {
    setRange({ from: values.min?.toString(), to: values.max?.toString() });
    setPrevValues(values);
  }

  return (
    <div
      {...props}
      className={cx(
        cx('ais-RangeInput', classNames.root),
        disabled &&
          cx('ais-RangeInput--noRefinement', classNames.noRefinementRoot),
        props.className
      )}
    >
      <form
        className={cx('ais-RangeInput-form', classNames.form)}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({
            min: from ? Number(from) : undefined,
            max: to ? Number(to) : undefined,
          });
        }}
      >
        <label className={cx('ais-RangeInput-label', classNames.label)}>
          <input
            className={cx(
              'ais-RangeInput-input',
              classNames.input,
              'ais-RangeInput-input--min',
              classNames.inputMin
            )}
            type="number"
            min={minRange}
            max={maxRange}
            value={stripLeadingZeroFromInput(from || unsetNumberInputValue)}
            step={step}
            placeholder={minRange?.toString()}
            disabled={disabled}
            onInput={({ currentTarget }) => {
              const value = currentTarget.value;
              setRange({
                from: value || unsetNumberInputValue,
                to,
              });
            }}
          />
        </label>
        <span className={cx('ais-RangeInput-separator', classNames.separator)}>
          {translations.separatorElementText}
        </span>
        <label className={cx('ais-RangeInput-label', classNames.label)}>
          <input
            className={cx(
              'ais-RangeInput-input',
              classNames.input,
              'ais-RangeInput-input--max',
              classNames.inputMax
            )}
            type="number"
            min={minRange}
            max={maxRange}
            value={stripLeadingZeroFromInput(to || unsetNumberInputValue)}
            step={step}
            placeholder={maxRange?.toString()}
            disabled={disabled}
            onInput={({ currentTarget }) => {
              const value = currentTarget.value;
              setRange({
                from,
                to: value || unsetNumberInputValue,
              });
            }}
          />
        </label>
        <button
          className={cx('ais-RangeInput-submit', classNames.submit)}
          type="submit"
        >
          {translations.submitButtonText}
        </button>
      </form>
    </div>
  );
}
