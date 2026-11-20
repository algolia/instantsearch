import React, { useRef, useState } from 'react';
import { useRefinementList } from 'react-instantsearch-core';

import { RefinementList as RefinementListUiComponent } from '../ui/RefinementList';
import { SearchBox as SearchBoxUiComponent } from '../ui/SearchBox';

import type { RefinementListProps as RefinementListUiComponentProps } from '../ui/RefinementList';
import type { SearchBoxProps } from '../ui/SearchBox';
import type { RefinementListItem } from 'instantsearch-core';
import type { RefinementListTranslations } from 'instantsearch-ui-components';
import type { UseRefinementListProps } from 'react-instantsearch-core';

type UiProps = Pick<
  RefinementListUiComponentProps,
  | 'items'
  | 'onRefine'
  | 'isFromSearch'
  | 'searchBoxComponent'
  | 'showNoResults'
  | 'noResultsComponent'
  | 'itemComponent'
  | 'showMoreTextComponent'
  | 'canToggleShowMore'
  | 'onToggleShowMore'
  | 'isShowingMore'
  | 'translations'
>;

export type RefinementListProps = Omit<
  RefinementListUiComponentProps,
  keyof UiProps
> &
  UseRefinementListProps & {
    searchable?: boolean;
    searchablePlaceholder?: string;
    searchableSelectOnSubmit?: boolean;
  } & {
    translations?: Partial<
      RefinementListTranslations & {
        submitButtonTitle: string;
        resetButtonTitle: string;
      }
    >;
  };

export function RefinementList({
  searchable,
  searchablePlaceholder,
  searchableSelectOnSubmit = true,
  attribute,
  operator,
  limit,
  showMore,
  showMoreLimit,
  sortBy,
  transformItems,
  translations,
  ...props
}: RefinementListProps) {
  const {
    canToggleShowMore,
    isFromSearch,
    isShowingMore,
    items,
    refine,
    searchForItems,
    toggleShowMore,
  } = useRefinementList(
    {
      attribute,
      operator,
      limit,
      showMore,
      showMoreLimit,
      sortBy,
      transformItems,
    },
    {
      $$widgetType: 'ais.refinementList',
    }
  );
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function setQuery(newQuery: string, compositionComplete = true) {
    setInputValue(newQuery);
    if (compositionComplete) {
      searchForItems(newQuery);
    }
  }

  function onRefine(item: RefinementListItem) {
    refine(item.value);
    setQuery('');
  }

  function onChange(
    event: Parameters<NonNullable<SearchBoxProps['onChange']>>[0]
  ) {
    const compositionComplete =
      event.type === 'compositionend' ||
      !(event.nativeEvent as KeyboardEvent).isComposing;

    setQuery(event.currentTarget.value, compositionComplete);
  }

  function onReset() {
    setQuery('');
  }

  function onSubmit() {
    if (searchableSelectOnSubmit === false) {
      return;
    }
    if (items.length > 0) {
      refine(items[0].value);
      setQuery('');
    }
  }

  const mergedTranslations: Required<
    Omit<
      NonNullable<RefinementListProps['translations']>,
      'showMoreButtonLabel'
    >
  > = {
    resetButtonTitle: 'Clear the search query',
    submitButtonTitle: 'Submit the search query',
    noResultsText: 'No results.',
    showMoreButtonText(options) {
      return options.isShowingMore ? 'Show less' : 'Show more';
    },
    ...translations,
  };

  const uiProps: UiProps = {
    items,
    onRefine,
    isFromSearch,
    searchBoxComponent: searchable
      ? () => (
          <SearchBoxUiComponent
            inputRef={inputRef}
            placeholder={searchablePlaceholder}
            isSearchStalled={false}
            value={inputValue}
            onChange={onChange}
            onReset={onReset}
            onSubmit={onSubmit}
            translations={{
              submitButtonTitle: mergedTranslations.submitButtonTitle,
              resetButtonTitle: mergedTranslations.resetButtonTitle,
            }}
          />
        )
      : undefined,
    showNoResults: Boolean(searchable && isFromSearch && items.length === 0),
    canToggleShowMore,
    onToggleShowMore: toggleShowMore,
    isShowingMore,
    translations: {
      showMoreButtonText: mergedTranslations.showMoreButtonText,
      showMoreButtonLabel: translations?.showMoreButtonLabel,
      noResultsText: mergedTranslations.noResultsText,
    },
  };

  return (
    <RefinementListUiComponent {...props} {...uiProps} showMore={showMore} />
  );
}
