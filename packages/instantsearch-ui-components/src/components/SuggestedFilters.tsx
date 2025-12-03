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
  onFilterClick: (attribute: string, value: string, isRefined: boolean) => void;
  indexUiState: object;
  classNames?: Partial<SuggestedFiltersClassNames>;
};

export function createSuggestedFiltersComponent({
  createElement,
}: Pick<Renderer, 'createElement'>) {
  const FilterPill = createFilterPillComponent({
    createElement,
  });

  return function SuggestedFilters(userProps: SuggestedFiltersProps) {
    const { filters, onFilterClick, indexUiState, classNames = {} } = userProps;

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
      <div className={cx('ais-ChatToolSuggestedFilters', classNames.root)}>
        <div className={cx('ais-SuggestedFilters-header', classNames.header)}>
          Suggested Filters
        </div>
        <div className={cx('ais-SuggestedFilters', classNames.list)}>
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
