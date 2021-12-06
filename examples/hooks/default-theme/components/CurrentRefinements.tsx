import React from 'react';
import {
  useCurrentRefinements,
  UseCurrentRefinementsProps,
} from 'react-instantsearch-hooks';

import { cx } from '../cx';
import { isSpecialClick } from '../isSpecialClick';

export type CurrentRefinementsProps = React.ComponentProps<'div'> &
  UseCurrentRefinementsProps;

export function CurrentRefinements(props: CurrentRefinementsProps) {
  const { items, refine, canRefine } = useCurrentRefinements(props);

  return (
    <div
      className={cx(
        'ais-CurrentRefinements',
        !canRefine && 'ais-CurrentRefinements--noRefinement',
        props.className
      )}
    >
      <ul
        className={cx(
          'ais-CurrentRefinements-list',
          !canRefine && 'ais-CurrentRefinements-list--noRefinement'
        )}
      >
        {items.map((item) => (
          <li key={item.label} className="ais-CurrentRefinements-item">
            <span className="ais-CurrentRefinements-label">
              {item.attribute}:
            </span>
            {item.refinements.map((refinement) => (
              <span
                key={refinement.label}
                className="ais-CurrentRefinements-category"
              >
                <span className="ais-CurrentRefinements-categoryLabel">
                  {refinement.label}
                </span>
                <button
                  onClick={(event) => {
                    if (isSpecialClick(event)) {
                      return;
                    }

                    event.preventDefault();

                    refine(refinement);
                  }}
                  className="ais-CurrentRefinements-delete"
                >
                  ✕
                </button>
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
