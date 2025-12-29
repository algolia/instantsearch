/** @jsx createElement */

import { cx } from '../lib/cx';

import { createFilterPillComponent } from './FilterPill';

import type { Renderer } from '../types';

export type SuggestedFilter = {
  label: string;
  attribute: string;
  value: string;
  count: number;
};

export type SuggestedFiltersClassNames = {
  /**
   * Class names to apply to the root element
   */
  root?: string | string[];
  /**
   * Class names to apply to the header element
   */
  header?: string | string[];
  /**
   * Class names to apply to the filters list element
   */
  list?: string | string[];
};

export type SuggestedFiltersProps = {
  filters: SuggestedFilter[];
  onFilterClick: (attribute: string, value: string) => void;
  classNames?: Partial<SuggestedFiltersClassNames>;
};

export function createSuggestedFiltersComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  const FilterPill = createFilterPillComponent({
    createElement,
  });

  return function SuggestedFilters(userProps: SuggestedFiltersProps) {
    const { filters, onFilterClick, classNames = {} } = userProps;

    if (filters.length === 0) {
      return null;
    }

    return (
      <div className={cx('ais-ChatToolSuggestedFilters', classNames.root)}>
        <div className={cx('ais-SuggestedFilters-header', classNames.header)}>
          Suggested Filters
        </div>
        <div className={cx('ais-SuggestedFilters', classNames.list)}>
          {filters.map((filter) => (
            <FilterPill
              key={`${filter.attribute}-${filter.value}`}
              label={filter.label}
              value={filter.value}
              count={filter.count}
              onClick={() => onFilterClick(filter.attribute, filter.value)}
            />
          ))}
        </div>
      </div>
    );
  };
}
