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

export type SuggestedFiltersProps = {
  filters: SuggestedFilter[];
  onFilterClick: (attribute: string, value: string, isRefined: boolean) => void;
  indexUiState: object;
  className?: string;
};

export function createSuggestedFiltersComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  const FilterPill = createFilterPillComponent({
    createElement,
  });

  return function SuggestedFilters(props: SuggestedFiltersProps) {
    const { filters, onFilterClick, indexUiState, className } = props;

    if (filters.length === 0) {
      return null;
    }

    // Check if a filter is currently refined
    const isRefined = (attribute: string, value: string): boolean => {
      const refinementList = (indexUiState as any).refinementList;
      if (!refinementList || !refinementList[attribute]) {
        return false;
      }
      return refinementList[attribute].includes(value);
    };

    return (
      <div className={cx('ais-ChatToolSuggestedFilters', className)}>
        <div className="ais-SuggestedFilters-header">Suggested Filters</div>
        <div className="ais-SuggestedFilters">
          {filters.map((filter) => {
            const refined = isRefined(filter.attribute, filter.value);
            return (
              <FilterPill
                key={`${filter.attribute}-${filter.value}`}
                label={filter.label}
                value={filter.value}
                count={filter.count}
                isRefined={refined}
                onClick={() =>
                  onFilterClick(filter.attribute, filter.value, refined)
                }
              />
            );
          })}
        </div>
      </div>
    );
  };
}
