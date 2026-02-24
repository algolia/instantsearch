/** @jsx createElement */

import { cx } from '../../lib';

import { ApplyIcon, ClockIcon, TrashIcon } from './icons';

import type { ComponentChildren, Renderer } from '../../types';

export type AutocompleteRecentSearchProps<
  T = { query: string } & Record<string, unknown>
> = {
  item: T;
  children?: ComponentChildren;
  onSelect: () => void;
  onRemoveRecentSearch: () => void;
  onApply: () => void;
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
  /**
   * Class names to apply to the apply button element
   **/
  applyButton: string | string[];
};

export function createAutocompleteRecentSearchComponent({
  createElement,
}: Renderer) {
  return function AutocompleteRecentSearch(
    userProps: AutocompleteRecentSearchProps
  ) {
    const {
      item,
      children,
      onSelect,
      onRemoveRecentSearch,
      onApply,
      classNames = {},
    } = userProps;
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
            <ClockIcon createElement={createElement} />
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
            <TrashIcon createElement={createElement} />
          </button>
          <button
            className={cx(
              'ais-AutocompleteItemActionButton',
              'ais-AutocompleteRecentSearchItemApplyButton',
              classNames.applyButton
            )}
            title={`Apply ${item.query} as search`}
            onClick={(evt) => {
              evt.stopPropagation();
              onApply();
            }}
          >
            <ApplyIcon createElement={createElement} />
          </button>
        </div>
      </div>
    );
  };
}
