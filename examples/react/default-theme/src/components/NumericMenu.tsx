import React from 'react';
import { useNumericMenu, UseNumericMenuProps } from 'react-instantsearch-core';

import { cx } from '../cx';

export type NumericMenuProps = React.ComponentProps<'div'> &
  UseNumericMenuProps;

export function NumericMenu(props: NumericMenuProps) {
  const { hasNoResults, items, refine } = useNumericMenu(props);

  return (
    <div
      className={cx(
        'ais-NumericMenu',
        hasNoResults && 'ais-NumericMenu--noRefinement',
        props.className
      )}
    >
      <ul className="ais-NumericMenu-list">
        {items.map((item) => (
          <li
            key={item.value}
            className={cx(
              'ais-NumericMenu-item',
              item.isRefined && 'ais-NumericMenu-item--selected'
            )}
          >
            <label className="ais-NumericMenu-label">
              <input
                className="ais-NumericMenu-radio"
                type="radio"
                checked={item.isRefined}
                onChange={() => refine(item.value)}
              />
              <span className="ais-NumericMenu-labelText">{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
