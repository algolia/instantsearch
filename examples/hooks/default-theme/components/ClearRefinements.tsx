import React from 'react';
import {
  useClearRefinements,
  UseClearRefinementsProps,
} from 'react-instantsearch-hooks';
import { cx } from '../cx';

export type ClearRefinementsProps = React.ComponentProps<'div'> &
  UseClearRefinementsProps;

export function ClearRefinements(props: ClearRefinementsProps) {
  const { canRefine, refine } = useClearRefinements(props);

  return (
    <div className={cx('ais-ClearRefinements', props.className)}>
      <button
        className={cx(
          'ais-ClearRefinements-button',
          !canRefine && 'ais-ClearRefinements-button--disabled'
        )}
        disabled={!canRefine}
        onClick={() => refine()}
      >
        Clear Refinements
      </button>
    </div>
  );
}
