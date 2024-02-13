import { cx } from 'instantsearch-ui-components';
import React from 'react';

import type { HitsPerPageConnectorParamsItem as HitsPerPageItem } from 'instantsearch.js/es/connectors/hits-per-page/connectHitsPerPage';

export type HitsPerPageProps = Omit<React.ComponentProps<'div'>, 'onChange'> & {
  items: HitsPerPageItem[];
  onChange: (value: number) => void;
  currentValue: number;
  classNames?: Partial<HitsPerPageClassNames>;
};

export type HitsPerPageClassNames = {
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

export function HitsPerPage({
  items,
  onChange,
  currentValue,
  classNames = {},
  ...props
}: HitsPerPageProps) {
  return (
    <div
      {...props}
      className={cx('ais-HitsPerPage', classNames.root, props.className)}
    >
      <select
        className={cx('ais-HitsPerPage-select', classNames.select)}
        onChange={(event) => {
          onChange(Number(event.target.value));
        }}
        value={String(currentValue)}
      >
        {items.map((item) => (
          <option
            key={item.value}
            className={cx('ais-HitsPerPage-option', classNames.option)}
            value={item.value}
          >
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
