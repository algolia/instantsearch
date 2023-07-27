import React from 'react';

import { cx } from './lib/cx';
import { isModifierClick } from './lib/isModifierClick';

import type {
  CurrentRefinementsConnectorParamsItem,
  CurrentRefinementsConnectorParamsRefinement,
} from 'instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements';

export type CurrentRefinementsProps = React.ComponentProps<'div'> & {
  classNames?: Partial<CurrentRefinementsClassNames>;
  items?: Array<
    Pick<CurrentRefinementsConnectorParamsItem, 'label' | 'refinements'> &
      Record<string, unknown>
  >;
  onRemove?: (refinement: CurrentRefinementsConnectorParamsRefinement) => void;
  hasRefinements?: boolean;
};

export type CurrentRefinementsClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
  /**
   * Class names to apply to the root element when there are no refinements possible
   */
  noRefinementRoot: string;
  /**
   * Class names to apply to the list element
   */
  list: string;
  /**
   * Class names to apply to the list element when there are no refinements possible
   */
  noRefinementList: string;
  /**
   * Class names to apply to each refinement
   */
  item: string;
  /**
   * Class names to apply to the label of each refinement
   */
  label: string;
  /**
   * Class names to apply to the container of each refinement's value
   */
  category: string;
  /**
   * Class names to apply to the text element of each refinement's value
   */
  categoryLabel: string;
  /**
   * Class names to apply to the each refinement's delete button
   */
  delete: string;
};

export function CurrentRefinements({
  classNames = {},
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
        classNames.root,
        !hasRefinements &&
          cx(
            'ais-CurrentRefinements--noRefinement',
            classNames.noRefinementRoot
          ),
        props.className
      )}
    >
      <ul
        className={cx(
          'ais-CurrentRefinements-list',
          classNames.list,
          !hasRefinements &&
            cx(
              'ais-CurrentRefinements-list--noRefinement',
              classNames.noRefinementList
            )
        )}
      >
        {items.map((item) => (
          <li
            key={[item.indexName, item.label].join('/')}
            className={cx('ais-CurrentRefinements-item', classNames.item)}
          >
            <span
              className={cx('ais-CurrentRefinements-label', classNames.label)}
            >
              {item.label}:
            </span>
            {item.refinements.map((refinement) => (
              <span
                key={refinement.label}
                className={cx(
                  'ais-CurrentRefinements-category',
                  classNames.category
                )}
              >
                <span
                  className={cx(
                    'ais-CurrentRefinements-categoryLabel',
                    classNames.categoryLabel
                  )}
                >
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
                  className={cx(
                    'ais-CurrentRefinements-delete',
                    classNames.delete
                  )}
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
