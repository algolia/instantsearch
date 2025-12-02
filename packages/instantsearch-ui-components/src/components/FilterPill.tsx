/** @jsx createElement */
import { cx } from '../lib/cx';

import type { Renderer } from '../types';

export type FilterPillProps = {
  label: string;
  value: string;
  count: number;
  isRefined: boolean;
  onClick: () => void;
  className?: string;
  key?: string;
};

export function createFilterPillComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  return function FilterPill(props: FilterPillProps) {
    const { label, value, count, isRefined, onClick, className } = props;

    return (
      <button
        className={cx(
          'ais-FilterPill',
          isRefined && 'ais-FilterPill--refined',
          className
        )}
        onClick={onClick}
        type="button"
      >
        <span className="ais-FilterPill-label">{label}:</span>
        <span className="ais-FilterPill-value">{value}</span>
        <span className="ais-FilterPill-count">({count})</span>
      </button>
    );
  };
}
