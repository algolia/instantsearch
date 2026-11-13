/** @jsx createElement */
import { cx } from '../lib';

import type { ComponentProps, Renderer } from '../types';

export type ToggleRefinementClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the label element
   */
  label: string | string[];
  /**
   * Class names to apply to the checkbox element
   */
  checkbox: string | string[];
  /**
   * Class names to apply to the label text
   */
  labelText: string | string[];
  /**
   * Class names to apply to the count element
   */
  count: string | string[];
};

export type ToggleRefinementValue = {
  /**
   * The attribute name of this toggle
   */
  name: string;
  /**
   * Whether this option is enabled
   */
  isRefined: boolean;
  /**
   * Number of results if this option is toggled
   */
  count: number | null;
};

export type ToggleRefinementProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  classNames?: Partial<ToggleRefinementClassNames>;
  /**
   * Whether the checkbox is checked
   */
  checked?: boolean;
  /**
   * Called with the next checked state when the checkbox changes
   */
  onChange?: (isChecked: boolean) => void;
  /**
   * The label of the toggle, used when `labelTextComponent` isn't provided
   */
  label?: string;
  /**
   * The number of results for this toggle, rendered next to the label when provided
   */
  count?: number | null;
  /**
   * The current toggle value, passed to `labelTextComponent`
   */
  value?: ToggleRefinementValue;
  /**
   * Overrides the content of the label text.
   * Returning `null` omits the `ais-ToggleRefinement-labelText` element
   * entirely — the JS flavor's `templates.labelText` used to own that span
   * and disappears from the DOM when the template resolves to `null`.
   */
  labelTextComponent?: (props: {
    value: ToggleRefinementValue;
  }) => JSX.Element | null;
};

export function createToggleRefinementComponent({ createElement }: Renderer) {
  return function ToggleRefinement(userProps: ToggleRefinementProps) {
    const {
      classNames = {},
      checked,
      onChange,
      label,
      count,
      labelTextComponent,
      value,
      ...props
    } = userProps;

    // Called rather than mounted so a `null` result can suppress the label
    // text element, as it did when the JS `Template` owned that markup.
    const labelText = labelTextComponent
      ? labelTextComponent({ value: value! })
      : label;

    return (
      <div
        {...props}
        className={cx('ais-ToggleRefinement', classNames.root, props.className)}
      >
        <label className={cx('ais-ToggleRefinement-label', classNames.label)}>
          <input
            className={cx('ais-ToggleRefinement-checkbox', classNames.checkbox)}
            type="checkbox"
            checked={checked}
            onChange={(event) => {
              onChange?.((event.target as HTMLInputElement).checked);
            }}
          />

          {labelText === null ? undefined : (
            <span
              className={cx(
                'ais-ToggleRefinement-labelText',
                classNames.labelText
              )}
            >
              {labelText}
            </span>
          )}
          {count !== undefined && count !== null && (
            <span
              className={cx('ais-ToggleRefinement-count', classNames.count)}
            >
              {count.toLocaleString()}
            </span>
          )}
        </label>
      </div>
    );
  };
}
