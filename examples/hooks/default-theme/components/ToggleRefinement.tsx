import React from 'react';
import {
  useToggleRefinement,
  UseToggleRefinementProps,
} from 'react-instantsearch-hooks';

import { cx } from '../cx';

export type ToggleRefinementProps = React.ComponentProps<'div'> &
  UseToggleRefinementProps;

export function ToggleRefinement(props: ToggleRefinementProps) {
  const { refine, value } = useToggleRefinement(props);

  return (
    <div className={cx('ais-ToggleRefinement', props.className)}>
      <label className="ais-ToggleRefinement-label">
        <input
          className="ais-ToggleRefinement-checkbox"
          type="checkbox"
          checked={value.isRefined}
          onChange={(event) => refine({ isRefined: !event.target.checked })}
        />

        <span className="ais-ToggleRefinement-labelText">{value.name}</span>
      </label>
    </div>
  );
}
