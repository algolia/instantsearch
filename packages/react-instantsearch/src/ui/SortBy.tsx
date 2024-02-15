import { cx } from 'instantsearch-ui-components';
import React from 'react';

import type { UseSortByProps } from 'react-instantsearch-core';

export type SortByProps = Omit<React.ComponentProps<'div'>, 'onChange'> &
  Pick<UseSortByProps, 'items'> &
  Pick<React.ComponentProps<'select'>, 'value'> & {
    onChange?: (value: string) => void;
    classNames?: Partial<SortByClassNames>;
  };

export type SortByClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
  /**
   * Class names to apply to the select element
   */
  select: string;
  /**
   * Class names to apply to the option element
   */
  option: string;
};

export function SortBy({
  items,
  value,
  onChange = () => {},
  classNames = {},
  ...props
}: SortByProps) {
  return (
    <div
      {...props}
      className={cx('ais-SortBy', classNames.root, props.className)}
    >
      <select
        className={cx('ais-SortBy-select', classNames.select)}
        onChange={(event) => onChange(event.target.value)}
        value={value}
        aria-label="Sort results by"
      >
        {items.map((item) => (
          <option
            className={cx('ais-SortBy-option', classNames.option)}
            key={item.value}
            value={item.value}
          >
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
