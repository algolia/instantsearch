import React from 'react';

import { cx } from './lib/cx';

import type { UseSortByProps } from 'react-instantsearch-hooks';

export type SortByProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> &
  Pick<UseSortByProps, 'items'> &
  Pick<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'> & {
    onChange?(value: string): void;
  };

export function SortBy({
  items,
  value,
  onChange = () => {},
  ...props
}: SortByProps) {
  return (
    <div {...props} className={cx('ais-SortBy', props.className)}>
      <select
        className="ais-SortBy-select"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {items.map((item) => (
          <option
            className="ais-SortBy-option"
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
