import React from 'react';

import { cx } from './lib/cx';

export type ClearRefinementsProps = React.HTMLAttributes<HTMLDivElement> &
  Pick<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'disabled' | 'onClick'
  > & {
    resetLabel?: string;
  };

export function ClearRefinements({
  resetLabel = 'Clear refinements',
  disabled = false,
  onClick = () => {},
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
        {resetLabel}
      </button>
    </div>
  );
}
