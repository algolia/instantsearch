import React, { useEffect, useRef, useState } from 'react';
import { useRefinementList } from 'react-instantsearch-hooks';

import { cx } from '../ui/lib/cx';
import { RefinementList as RefinementListUiComponent } from '../ui/RefinementList';
import { SearchBox as SearchBoxUiComponent } from '../ui/SearchBox';
import { ShowMoreButton } from '../ui/ShowMoreButton';

import type { RefinementListProps as RefinementListUiComponentProps } from '../ui/RefinementList';
import type { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';
import type { RefinementListWidgetParams } from 'instantsearch.js/es/widgets/refinement-list/refinement-list';
import type { UseRefinementListProps } from 'react-instantsearch-hooks';

export type RefinementListProps = Omit<
  RefinementListUiComponentProps,
  'items' | 'onRefine' | 'query' | 'searchBox' | 'noResults' | 'showMoreButton'
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
  const [query, setQuery] = useState('');
  const previousQueryRef = useRef(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (previousQueryRef.current !== query) {
      previousQueryRef.current = query;
      searchForItems(query);
    }
  }, [query, searchForItems]);

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

  return (
    <RefinementListUiComponent
      {...props}
      items={items}
      onRefine={onRefine}
      query={query}
      searchBox={
        searchable && (
          <SearchBoxUiComponent
            inputRef={inputRef}
            placeholder={searchablePlaceholder}
            isSearchStalled={false}
            value={query}
            onChange={onChange}
            onReset={onReset}
            onSubmit={onSubmit}
          />
        )
      }
      noResults={
        searchable && isFromSearch && items.length === 0 && 'No results.'
      }
      showMoreButton={
        showMore && (
          <ShowMoreButton
            className={cx(
              'ais-RefinementList-showMore',
              !canToggleShowMore && 'ais-RefinementList-showMore--disabled'
            )}
            disabled={!canToggleShowMore}
            onClick={toggleShowMore}
            isShowingMore={isShowingMore}
          />
        )
      }
    />
  );
}
