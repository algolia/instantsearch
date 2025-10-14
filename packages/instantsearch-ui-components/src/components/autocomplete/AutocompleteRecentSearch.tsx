/** @jsx createElement */

import { cx } from '../../lib';

import type { Renderer } from '../../types';

export type AutocompleteRecentSearchProps<
  T = { query: string } & Record<string, unknown>
> = {
  item: T;
  onSelect: () => void;
  onRemoveRecentSearch: () => void;
  classNames?: Partial<AutocompleteRecentSearchClassNames>;
};

export type AutocompleteRecentSearchClassNames = {
  /**
   * Class names to apply to the root element
   **/
  root: string | string[];
};

export function createAutocompleteRecentSearchComponent({
  createElement,
}: Renderer) {
  return function AutocompleteRecentSearch({
    item,
    onSelect,
    onRemoveRecentSearch,
    classNames = {},
  }: AutocompleteRecentSearchProps) {
    return (
      <div
        onClick={onSelect}
        className={cx('ais-AutocompleteRecentSearch', classNames.root)}
      >
        {item.query}
        <button
          className={cx('ais-AutocompleteRecentSearchRemove')}
          title={`Remove ${item.query} from recent searches`}
          onClick={onRemoveRecentSearch}
        />
      </div>
    );
  };
}
