/** @jsx createElement */
import { cx } from '../lib';

import type { ComponentProps, Renderer } from '../types';

export type SelectorOption = {
  /**
   * The value to send when the option is selected
   */
  value: string | number | undefined;
  /**
   * The label of the option to display
   */
  label: string;
};

export type SelectorClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the select element
   */
  select: string | string[];
  /**
   * Class names to apply to each option element
   */
  option: string | string[];
};

export type SelectorProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  classNames?: Partial<SelectorClassNames>;
  /**
   * The options to display
   */
  options: SelectorOption[];
  /**
   * The currently selected value
   */
  value?: string | number;
  /**
   * Called with the next selected value
   */
  onChange?: (value: string) => void;
  /**
   * The `aria-label` of the select element
   */
  ariaLabel?: string;
};

/**
 * The select markup shared by widgets that let users pick a value from a list
 * of options (e.g. SortBy, HitsPerPage). Consumers own the `ais-<Widget>` class
 * names and pass them through `classNames`.
 */
export function createSelectorComponent({ createElement }: Renderer) {
  return function Selector(userProps: SelectorProps) {
    const {
      classNames = {},
      options,
      value,
      onChange,
      ariaLabel,
      ...props
    } = userProps;

    const stringValue = value === undefined ? undefined : `${value}`;
    // Some consumers (e.g. HitsPerPage) insert a blank option with value `''`
    // as the "no refinement" sentinel. Select it explicitly when nothing else
    // matches: passing `undefined` instead makes the select uncontrolled in
    // React, which keeps a stale selection visible after e.g. routing.
    const matchesAnOption = options.some(
      (option) => `${option.value}` === stringValue
    );
    const selectValue =
      !matchesAnOption && options.some((option) => option.value === '')
        ? ''
        : stringValue;

    return (
      <div {...props} className={cx(classNames.root, props.className)}>
        <select
          className={cx(classNames.select)}
          onChange={(event) => {
            onChange?.((event.target as HTMLSelectElement).value);
          }}
          value={selectValue}
          aria-label={ariaLabel}
        >
          {options.map((option) => (
            <option
              className={cx(classNames.option)}
              key={option.label + option.value}
              value={`${option.value}`}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };
}
