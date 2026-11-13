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
   * Overrides the content of the button
   */
  resetLabelComponent?: (props: { canRefine: boolean }) => JSX.Element;
};

export function createClearRefinementsComponent({ createElement }: Renderer) {
  return function ClearRefinements(userProps: ClearRefinementsProps) {
    const {
      classNames = {},
      canRefine = false,
      onClick,
      translations,
      resetLabelComponent: ResetLabelComponent,
      ...props
    } = userProps;

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
          {ResetLabelComponent ? (
            <ResetLabelComponent canRefine={canRefine} />
          ) : (
            (translations?.resetButtonText ?? 'Clear refinements')
          )}
        </button>
      </div>
    );
  };
}
