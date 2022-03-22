import React from 'react';

import { cx } from './lib/cx';

export type ClearRefinementsTranslations = {
  /**
   * The label of the button.
   */
  resetLabel: string;
};

export type ClearRefinementsProps = React.HTMLAttributes<HTMLDivElement> &
  Pick<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'disabled' | 'onClick'
  > & {
    translations: ClearRefinementsTranslations;
  };

export function ClearRefinements({
  disabled = false,
  onClick = () => {},
  translations,
  ...props
}: ClearRefinementsProps) {
  return (
    <div {...props} className={cx('ais-ClearRefinements', props.className)}>
      <button
        disabled={disabled}
        onClick={onClick}
        className={cx(
          'ais-ClearRefinements-button',
          disabled && 'ais-ClearRefinements-button--disabled'
        )}
      >
        {translations.resetLabel}
      </button>
    </div>
  );
}
