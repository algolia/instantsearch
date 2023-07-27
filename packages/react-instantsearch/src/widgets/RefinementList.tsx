import React, { useRef, useState } from 'react';
import { useRefinementList } from 'react-instantsearch-core';

import { RefinementList as RefinementListUiComponent } from '../ui/RefinementList';
import { SearchBox as SearchBoxUiComponent } from '../ui/SearchBox';

import type { RefinementListProps as RefinementListUiComponentProps } from '../ui/RefinementList';
import type { SearchBoxTranslations } from '../ui/SearchBox';
import type { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';
import type { RefinementListWidgetParams } from 'instantsearch.js/es/widgets/refinement-list/refinement-list';
import type { UseRefinementListProps } from 'react-instantsearch-core';

type UiProps = Pick<
  RefinementListUiComponentProps,
  | 'canRefine'
  | 'items'
  | 'onRefine'
  | 'query'
  | 'searchBox'
  | 'noResults'
  | 'canToggleShowMore'
  | 'onToggleShowMore'
  | 'isShowingMore'
  | 'translations'
>;

export type RefinementListProps = Omit<
  RefinementListUiComponentProps,
  keyof UiProps
> &
  UseRefinementListProps &
  Pick<RefinementListWidgetParams, 'searchable' | 'searchablePlaceholder'> & {
    translations?: Partial<
      UiProps['translations'] &
        SearchBoxTranslations & {
          /**
           * What to display when there are no results.
           */
          noResultsText: string;
        }
    >;
  };

export function RefinementList({
  searchable,
  searchablePlaceholder,
  attribute,
  operator,
  limit,
  showMore,
  showMoreLimit,
  sortBy,
  escapeFacetValues,
  transformItems,
  translations,
  ...props
}: RefinementListProps) {
  const {
    canRefine,
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
      escapeFacetValues,
      transformItems,
    },
    {
      $$widgetType: 'ais.refinementList',
    }
  );
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function setQuery(newQuery: string) {
    setInputValue(newQuery);
    searchForItems(newQuery);
  }

  function onRefine(item: RefinementListItem) {
    refine(item.value);
    setQuery('');
  }

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.currentTarget.value);
  }

  function onReset() {
    setQuery('');
  }

  function onSubmit() {
    if (items.length > 0) {
      refine(items[0].value);
      setQuery('');
    }
  }

  const mergedTranslations: Required<RefinementListProps['translations']> = {
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
    canRefine,
    onRefine,
    query: inputValue,
    searchBox: searchable && (
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
    ),
    noResults:
      searchable &&
      isFromSearch &&
      items.length === 0 &&
      mergedTranslations.noResultsText,
    canToggleShowMore,
    onToggleShowMore: toggleShowMore,
    isShowingMore,
    translations: {
      showMoreButtonText: mergedTranslations.showMoreButtonText,
    },
  };

  return (
    <RefinementListUiComponent {...props} {...uiProps} showMore={showMore} />
  );
}
