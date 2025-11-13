/** @jsx createElement */

import { cx } from '../../lib';

import { AutocompleteClockIcon, AutocompleteTrashIcon } from './icons';

import type { ComponentChildren, Renderer } from '../../types';

export type AutocompleteRecentSearchProps<
  T = { query: string } & Record<string, unknown>
> = {
  item: T;
  children?: ComponentChildren;
  onSelect: () => void;
  onRemoveRecentSearch: () => void;
  classNames?: Partial<AutocompleteRecentSearchClassNames>;
};

export type AutocompleteRecentSearchClassNames = {
  /**
   * Class names to apply to the root element
   **/
  root: string | string[];
  /**
   * Class names to apply to the content element
   **/
  content: string | string[];
  /**
   * Class names to apply to the actions element
   **/
  actions: string | string[];
  /**
   * Class names to apply to the icon element
   **/
  icon: string | string[];
  /**
   * Class names to apply to the body element
   **/
  body: string | string[];
  /**
   * Class names to apply to the delete button element
   **/
  deleteButton: string | string[];
};

export function createAutocompleteRecentSearchComponent({
  createElement,
}: Renderer) {
  return function AutocompleteRecentSearch({
    item,
    children,
    onSelect,
    onRemoveRecentSearch,
    classNames = {},
  }: AutocompleteRecentSearchProps) {
    return (
      <div
        onClick={onSelect}
        className={cx(
          'ais-AutocompleteItemWrapper ais-AutocompleteRecentSearchWrapper',
          classNames.root
        )}
      >
        <div
          className={cx(
            'ais-AutocompleteItemContent',
            'ais-AutocompleteRecentSearchItemContent',
            classNames.content
          )}
        >
          <div
            className={cx(
              'ais-AutocompleteItemIcon',
              'ais-AutocompleteRecentSearchItemIcon',
              classNames.content
            )}
          >
            <AutocompleteClockIcon createElement={createElement} />
          </div>
          <div
            className={cx(
              'ais-AutocompleteItemContentBody',
              'ais-AutocompleteRecentSearchItemContentBody',
              classNames.content
            )}
          >
            {children}
          </div>
        </div>
        <div
          className={cx(
            'ais-AutocompleteItemActions',
            'ais-AutocompleteRecentSearchItemActions',
            classNames.actions
          )}
        >
          <button
            className={cx(
              'ais-AutocompleteItemActionButton',
              'ais-AutocompleteRecentSearchItemDeleteButton',
              classNames.deleteButton
            )}
            title={`Remove ${item.query} from recent searches`}
            onClick={(evt) => {
              evt.stopPropagation();
              onRemoveRecentSearch();
            }}
          >
            <AutocompleteTrashIcon createElement={createElement} />
          </button>
        </div>
      </div>
    );
  };
}
