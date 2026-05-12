import { cx } from 'instantsearch-ui-components';
import React from 'react';

import type { MenuItem } from 'instantsearch.js/es/connectors/menu/connectMenu';

export type MenuSelectProps = Omit<
  React.ComponentProps<'div'>,
  'onChange' | 'defaultValue'
> & {
  items: MenuItem[];
  value: string;
  onChange?: (value: string) => void;
  classNames?: Partial<MenuSelectClassNames>;
  defaultOptionLabel?: string;
  itemLabel?: (item: MenuItem) => React.ReactNode;
};

export type MenuSelectClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
  /**
   * Class names to apply to the root element when there are no refinements possible
   */
  noRefinementRoot: string;
  /**
   * Class names to apply to the select element
   */
  select: string;
  /**
   * Class names to apply to the option element
   */
  option: string;
};

export function MenuSelect({
  items,
  value,
  onChange = () => {},
  classNames = {},
  defaultOptionLabel = 'See all',
  itemLabel = (item) => `${item.label} (${item.count})`,
  ...props
}: MenuSelectProps) {
  return (
    <div
      {...props}
      className={cx(
        'ais-MenuSelect',
        classNames.root,
        items.length === 0 &&
          cx('ais-MenuSelect--noRefinement', classNames.noRefinementRoot),
        props.className
      )}
    >
      <select
        className={cx('ais-MenuSelect-select', classNames.select)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option
          className={cx('ais-MenuSelect-option', classNames.option)}
          value=""
        >
          {defaultOptionLabel}
        </option>
        {items.map((item) => (
          <option
            key={item.value}
            className={cx('ais-MenuSelect-option', classNames.option)}
            value={item.value}
          >
            {itemLabel(item)}
          </option>
        ))}
      </select>
    </div>
  );
}
