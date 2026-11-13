/** @jsx createElement */
import { cx } from '../lib';

import type { ComponentProps, Renderer } from '../types';

export type ClearRefinementsClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the button
   */
  button: string | string[];
  /**
   * Class names to apply to the button when it's disabled
   */
  disabledButton: string | string[];
};

export type ClearRefinementsTranslations = {
  /**
   * The label of the button
   */
  resetButtonText?: string;
};

export type ClearRefinementsProps = ComponentProps<'div'> & {
  classNames?: Partial<ClearRefinementsClassNames>;
  /**
   * Whether there are refinements to clear, and thus whether the button is enabled
   */
  canRefine?: boolean;
  /**
   * Called when the button is clicked
   */
  onClick?: () => void;
  translations?: ClearRefinementsTranslations;
  /**
   * Overrides the content of the button.
   * Returning `null` omits the button entirely — the JS flavor's
   * `templates.resetLabel` used to own the button and disappears from the
   * DOM when the template resolves to `null`.
   */
  resetLabelComponent?: (props: { canRefine: boolean }) => JSX.Element | null;
};

export function createClearRefinementsComponent({ createElement }: Renderer) {
  return function ClearRefinements(userProps: ClearRefinementsProps) {
    const {
      classNames = {},
      canRefine = false,
      onClick,
      translations,
      resetLabelComponent,
      ...props
    } = userProps;

    // Called rather than mounted: the override is a plain render function in
    // every flavor (JS template adapter, Vue scoped slot) and calling it lets
    // a `null` result suppress the button, as it did when the template owned
    // the button markup.
    const resetLabel = resetLabelComponent
      ? resetLabelComponent({ canRefine })
      : (translations?.resetButtonText ?? 'Clear refinements');

    if (resetLabel === null) {
      return (
        <div
          {...props}
          className={cx(
            'ais-ClearRefinements',
            classNames.root,
            props.className
          )}
        />
      );
    }

    return (
      <div
        {...props}
        className={cx('ais-ClearRefinements', classNames.root, props.className)}
      >
        <button
          type="button"
          disabled={!canRefine}
          onClick={onClick}
          className={cx(
            'ais-ClearRefinements-button',
            classNames.button,
            !canRefine &&
              cx(
                'ais-ClearRefinements-button--disabled',
                classNames.disabledButton
              )
          )}
        >
          {resetLabel}
        </button>
      </div>
    );
  };
}
