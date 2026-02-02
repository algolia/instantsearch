/** @jsx createElement */

import { cx } from '../../lib/cx';

import { ClearIcon, SearchIcon } from './icons';

import type { Renderer } from '../../types';
import type { AutocompleteClassNames } from './Autocomplete';

export type AutocompleteDetachedTranslations = {
  detachedCancelButtonText: string;
  detachedSearchButtonTitle: string;
  detachedClearButtonTitle: string;
};

export type AutocompleteDetachedSearchButtonProps = {
  query: string;
  placeholder?: string;
  classNames?: Partial<AutocompleteClassNames>;
  onClick: () => void;
  onClear?: () => void;
  translations: AutocompleteDetachedTranslations;
};

export function createAutocompleteDetachedSearchButtonComponent({
  createElement,
}: Renderer) {
  return function AutocompleteDetachedSearchButton(
    props: AutocompleteDetachedSearchButtonProps
  ) {
    const {
      query,
      placeholder = 'Search',
      classNames = {},
      onClick,
      onClear,
      translations,
    } = props;

    return (
      <div
        className={cx(
          'ais-AutocompleteDetachedSearchButton',
          classNames.detachedSearchButton
        )}
        onClick={onClick}
        onKeyDown={(event: any) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
        title={translations.detachedSearchButtonTitle}
      >
        <div
          className={cx(
            'ais-AutocompleteDetachedSearchButtonIcon',
            classNames.detachedSearchButtonIcon
          )}
        >
          <SearchIcon createElement={createElement} />
        </div>
        <div
          className={cx(
            'ais-AutocompleteDetachedSearchButtonPlaceholder',
            classNames.detachedSearchButtonPlaceholder
          )}
          hidden={Boolean(query)}
        >
          {placeholder}
        </div>
        <div
          className={cx(
            'ais-AutocompleteDetachedSearchButtonQuery',
            classNames.detachedSearchButtonQuery
          )}
        >
          {query}
        </div>
        {query && onClear && (
          <button
            type="reset"
            className={cx(
              'ais-AutocompleteDetachedSearchButtonClear',
              classNames.detachedSearchButtonClear
            )}
            title={translations.detachedClearButtonTitle}
            onClick={(event) => {
              event.stopPropagation();
              onClear();
            }}
          >
            <ClearIcon createElement={createElement} />
          </button>
        )}
      </div>
    );
  };
}
