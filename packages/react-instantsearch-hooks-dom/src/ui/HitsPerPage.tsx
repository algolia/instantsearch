import React from 'react';

import { cx } from './lib/cx';

import type { HitsPerPageConnectorParamsItem as HitsPerPageItem } from 'instantsearch.js/es/connectors/hits-per-page/connectHitsPerPage';

export type HitsPerPageProps = React.HTMLAttributes<HTMLDivElement> & {
  items: HitsPerPageItem[];
  onChange: (value: number) => void;
  currentValue: number;
};

export function HitsPerPage({
  items,
  onChange,
  currentValue,
  ...props
}: HitsPerPageProps) {
  return (
    <div {...props} className={cx('ais-HitsPerPage', props.className)}>
      <select
        className="ais-HitsPerPage-select"
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
        value={String(currentValue)}
      >
        {items.map((item) => (
          <option
            key={item.value}
            className="ais-HitsPerPage-option"
            value={item.value}
          >
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
