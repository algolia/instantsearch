/** @jsx createElement */
import { cx } from '../lib/cx';

import type { Renderer } from '../types';

export type FilterPillClassNames = {
  /**
   * Class names to apply to the root element
   */
  root?: string | string[];
  /**
   * Class names to apply to the label element
   */
  label?: string | string[];
  /**
   * Class names to apply to the value element
   */
  value?: string | string[];
  /**
   * Class names to apply to the count element
   */
  count?: string | string[];
};

export type FilterPillProps = {
  label: string;
  value: string;
  count: number;
  onClick: () => void;
  classNames?: Partial<FilterPillClassNames>;
  key?: string;
};

export function createFilterPillComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return function FilterPill(userProps: FilterPillProps) {
    const { label, value, count, onClick, classNames = {} } = userProps;

    return (
      <button
        className={cx('ais-FilterPill', classNames.root)}
        onClick={onClick}
        type="button"
      >
        <span className={cx('ais-FilterPill-label', classNames.label)}>
          {label}:
        </span>
        <span className={cx('ais-FilterPill-value', classNames.value)}>
          {value}
        </span>
        <span className={cx('ais-FilterPill-count', classNames.count)}>
          ({count})
        </span>
      </button>
    );
  };
}
