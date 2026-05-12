import { cx } from 'instantsearch-ui-components';
import React from 'react';

import type { NumericMenuRenderStateItem } from 'instantsearch.js/es/connectors/numeric-menu/connectNumericMenu';

export type NumericMenuProps = Omit<React.ComponentProps<'div'>, 'onChange'> & {
  items: NumericMenuRenderStateItem[];
  attribute: string;
  onRefine: (value: string) => void;
  classNames?: Partial<NumericMenuClassNames>;
};

export type NumericMenuClassNames = {
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
   * Class names to apply to each item element
   */
  item: string;
  /**
   * Class names to apply to each selected item element
   */
  selectedItem: string;
  /**
   * Class names to apply to each label element
   */
  label: string;
  /**
   * Class names to apply to each radio input element
   */
  radio: string;
  /**
   * Class names to apply to each label text element
   */
  labelText: string;
};

export function NumericMenu({
  items,
  attribute,
  onRefine,
  classNames = {},
  ...props
}: NumericMenuProps) {
  return (
    <div
      {...props}
      className={cx(
        'ais-NumericMenu',
        classNames.root,
        items.length === 0 &&
          cx('ais-NumericMenu--noRefinement', classNames.noRefinementRoot),
        props.className
      )}
    >
      <ul className={cx('ais-NumericMenu-list', classNames.list)}>
        {items.map((item) => (
          <li
            key={item.value}
            className={cx(
              'ais-NumericMenu-item',
              classNames.item,
              item.isRefined &&
                cx('ais-NumericMenu-item--selected', classNames.selectedItem)
            )}
          >
            <label className={cx('ais-NumericMenu-label', classNames.label)}>
              <input
                className={cx('ais-NumericMenu-radio', classNames.radio)}
                type="radio"
                name={attribute}
                value={item.value}
                checked={item.isRefined}
                onChange={(event) => onRefine(event.target.value)}
              />
              <span
                className={cx(
                  'ais-NumericMenu-labelText',
                  classNames.labelText
                )}
              >
                {item.label}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
