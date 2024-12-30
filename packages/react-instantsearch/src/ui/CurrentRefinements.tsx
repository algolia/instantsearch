import { cx } from 'instantsearch-ui-components';
import React from 'react';

import { capitalize, isModifierClick } from './lib';

import type { CurrentRefinementsConnectorParamsItem } from 'instantsearch-core';

export type CurrentRefinementsProps = React.ComponentProps<'div'> & {
  classNames?: Partial<CurrentRefinementsClassNames>;
  items?: Array<
    Pick<
      CurrentRefinementsConnectorParamsItem,
      'label' | 'refinements' | 'refine'
    > &
      Record<string, unknown>
  >;
  canRefine?: boolean;
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
  canRefine = false,
  ...props
}: CurrentRefinementsProps) {
  return (
    <div
      {...props}
      className={cx(
        'ais-CurrentRefinements',
        classNames.root,
        !canRefine &&
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
          /* @MAJOR remove to ensure conformity with InstantSearch.css specs */
          !canRefine &&
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
              {capitalize(item.label)}:{' '}
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

                    item.refine(refinement);
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
