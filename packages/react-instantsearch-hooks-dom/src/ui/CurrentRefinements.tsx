import React from 'react';

import { cx } from './lib/cx';
import { isModifierClick } from './lib/isModifierClick';

import type {
  CurrentRefinementsConnectorParamsItem,
  CurrentRefinementsConnectorParamsRefinement,
} from 'instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements';

export type CurrentRefinementsProps = React.HTMLAttributes<HTMLDivElement> & {
  items?: Array<
    Pick<CurrentRefinementsConnectorParamsItem, 'label' | 'refinements'> &
      Record<string, unknown>
  >;
  onRemove?(refinement: CurrentRefinementsConnectorParamsRefinement): void;
  hasRefinements?: boolean;
};

export function CurrentRefinements({
  items = [],
  onRemove = () => {},
  hasRefinements = false,
  ...props
}: CurrentRefinementsProps) {
  return (
    <div
      {...props}
      className={cx(
        'ais-CurrentRefinements',
        !hasRefinements && 'ais-CurrentRefinements--noRefinement',
        props.className
      )}
    >
      <ul
        className={cx(
          'ais-CurrentRefinements-list',
          !hasRefinements && 'ais-CurrentRefinements-list--noRefinement'
        )}
      >
        {items.map((item) => (
          <li key={item.label} className="ais-CurrentRefinements-item">
            <span className="ais-CurrentRefinements-label">{item.label}:</span>
            {item.refinements.map((refinement) => (
              <span
                key={refinement.label}
                className="ais-CurrentRefinements-category"
              >
                <span className="ais-CurrentRefinements-categoryLabel">
                  {refinement.label}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    if (isModifierClick(event)) {
                      return;
                    }

                    onRemove(refinement);
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
