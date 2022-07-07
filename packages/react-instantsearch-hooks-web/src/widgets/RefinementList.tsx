import React, { useRef, useState } from 'react';
import { useRefinementList } from 'react-instantsearch-hooks';

import { RefinementList as RefinementListUiComponent } from '../ui/RefinementList';
import { SearchBox as SearchBoxUiComponent } from '../ui/SearchBox';

import type { RefinementListProps as RefinementListUiComponentProps } from '../ui/RefinementList';
import type { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';
import type { RefinementListWidgetParams } from 'instantsearch.js/es/widgets/refinement-list/refinement-list';
import type { UseRefinementListProps } from 'react-instantsearch-hooks';

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
>;

export type RefinementListProps = Omit<
  RefinementListUiComponentProps,
  keyof UiProps
> &
  UseRefinementListProps &
  Pick<RefinementListWidgetParams, 'searchable' | 'searchablePlaceholder'>;

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
          submitTitle: 'Submit the search query.',
          resetTitle: 'Clear the search query.',
        }}
      />
    ),
    noResults:
      searchable && isFromSearch && items.length === 0 && 'No results.',
    canToggleShowMore,
    onToggleShowMore: toggleShowMore,
    isShowingMore,
  };

  return (
    <RefinementListUiComponent {...props} {...uiProps} showMore={showMore} />
  );
}
