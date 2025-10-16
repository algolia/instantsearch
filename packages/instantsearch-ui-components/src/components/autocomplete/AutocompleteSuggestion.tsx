/** @jsx createElement */

import { cx } from '../../lib';

import type { Renderer } from '../../types';

export type AutocompleteSuggestionProps<
  T = { query: string } & Record<string, unknown>
> = {
  item: T;
  onSelect: () => void;
  classNames?: Partial<AutocompleteSuggestionClassNames>;
};

export type AutocompleteSuggestionClassNames = {
  /**
   * Class names to apply to the root element
   **/
  root: string | string[];
};

export function createAutocompleteSuggestionComponent({
  createElement,
}: Renderer) {
  return function AutocompleteSuggestion({
    item,
    onSelect,
    classNames = {},
  }: AutocompleteSuggestionProps) {
    return (
      <div
        onClick={onSelect}
        className={cx('ais-AutocompleteSuggestion', classNames.root)}
      >
        {item.query}
      </div>
    );
  };
}
