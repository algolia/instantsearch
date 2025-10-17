import {
  createAutocompleteComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompleteSuggestionComponent,
  createAutocompleteRecentSearchComponent,
  cx,
} from 'instantsearch-ui-components';
import React, {
  createElement,
  useState,
  Fragment,
  useSyncExternalStore,
  useRef,
} from 'react';
import { Index, useHits, useInstantSearch } from 'react-instantsearch-core';

import { SearchBox } from '../widgets/SearchBox';

import { createStorage } from './createStorage';

import type {
  AutocompleteIndexClassNames,
  Pragma,
} from 'instantsearch-ui-components';
import type { BaseHit, Hit } from 'instantsearch.js';

const Autocomplete = createAutocompleteComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompletePanel = createAutocompletePanelComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompleteIndex = createAutocompleteIndexComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompleteSuggestion = createAutocompleteSuggestionComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompleteRecentSearch = createAutocompleteRecentSearchComponent({
  createElement: createElement as Pragma,
  Fragment,
});

type ItemComponentProps<TItem> = React.ComponentType<{
  item: TItem;
  onSelect: () => void;
  classNames: Partial<AutocompleteIndexClassNames>;
}>;

type IndexConfig<TItem extends Hit<BaseHit> = Hit<BaseHit> | any> = {
  indexName: string;
  getQuery?: (item: TItem) => string;
  getURL?: (item: TItem) => string;
  itemComponent: ItemComponentProps<TItem>;
  onSelect?: (params: {
    item: TItem;
    getQuery: () => string;
    getURL: () => string;
    setQuery: (query: string) => void;
  }) => void;
  classNames?: Partial<AutocompleteIndexClassNames>;
};

export type AutocompleteProps = {
  indices?: IndexConfig[];
  showSuggestions?: {
    itemComponent?: ItemComponentProps<Hit<{ query: string }>>;
    indexName?: string;
    classNames?: Partial<AutocompleteIndexClassNames>;
  };
  showRecent?:
    | boolean
    | {
        itemComponent: ItemComponentProps<{ query: string }> & {
          onRemoveRecentSearch: () => void;
        };
      };
};

export function EXPERIMENTAL_Autocomplete({
  indices: userIndices = [],
  showSuggestions,
  showRecent,
}: AutocompleteProps) {
  const storageRef = useRef(createStorage({ limit: 5 }));
  const storage = useSyncExternalStore(
    (onStorageChange) => {
      storageRef.current.registerUpdateListener(onStorageChange);
      return () => {
        storageRef.current.unregisterUpdateListener();
      };
    },
    () => storageRef.current
  );
  const { indexUiState, setIndexUiState } = useInstantSearch();
  const [isOpen, setIsOpen] = useState(false);

  const indices = [...userIndices];

  if (showSuggestions?.indexName) {
    indices.unshift({
      indexName: showSuggestions.indexName,
      itemComponent: showSuggestions.itemComponent || AutocompleteSuggestion,
      classNames: {
        root: cx(
          'ais-AutocompleteSuggestions',
          showSuggestions?.classNames?.root
        ),
        list: cx(
          'ais-AutocompleteSuggestionsList',
          showSuggestions?.classNames?.list
        ),
        item: cx(
          'ais-AutocompleteSuggestionsItem',
          showSuggestions?.classNames?.item
        ),
      },
      getQuery: (item) => item.query,
      onSelect: ({ getQuery, setQuery }) => {
        setQuery(getQuery());
      },
    });
  }

  const setQuery = (query: string) => {
    storage.onAdd(query);
    setIndexUiState((state) => ({ ...state, query }));
  };

  const query = indexUiState.query || '';

  const AutocompleteRecentSearchComponent =
    (typeof showRecent === 'object' && showRecent.itemComponent) ||
    AutocompleteRecentSearch;

  return (
    <Autocomplete isOpen={isOpen}>
      <Index EXPERIMENTAL_isolated>
        <SearchBox onFocus={() => setIsOpen(true)} />
        <AutocompletePanel isOpen={isOpen}>
          {showRecent && (
            <AutocompleteIndexComponent
              setQuery={setQuery}
              itemComponent={({ item, onSelect, classNames }) => (
                <AutocompleteRecentSearchComponent
                  item={item}
                  onSelect={onSelect}
                  classNames={classNames}
                  onRemoveRecentSearch={() => storage.onRemove(item.query)}
                />
              )}
              classNames={{
                root: 'ais-AutocompleteRecentSearches',
                list: 'ais-AutocompleteRecentSearchesList',
                item: 'ais-AutocompleteRecentSearchesItem',
              }}
              items={storage
                .getAll(query)
                .map((value) => ({ objectID: value, query: value }))}
            />
          )}
          {indices.map((index) => (
            <Index key={index.indexName} indexName={index.indexName}>
              <AutocompleteIndexComponent {...index} setQuery={setQuery} />
            </Index>
          ))}
        </AutocompletePanel>
      </Index>
    </Autocomplete>
  );
}

export function AutocompleteIndexComponent<
  T extends { objectID: string } & Record<string, unknown> = {
    objectID: string;
  } & Record<string, unknown>
>({
  itemComponent: ItemComponent,
  onSelect,
  getQuery,
  getURL,
  setQuery,
  classNames,
  items,
}: Omit<IndexConfig, 'indexName'> & {
  setQuery: (query: string) => void;
  items?: T[];
}) {
  const { items: hits } = useHits();

  return (
    <AutocompleteIndex
      // @ts-expect-error - there seems to be problems with React.ComponentType and this, but it's actually correct
      ItemComponent={ItemComponent}
      items={items || hits}
      onSelect={(item) => {
        onSelect?.({
          item,
          getQuery: () => getQuery?.(item) || '',
          getURL: () => getURL?.(item) || '',
          setQuery,
        });
      }}
      classNames={classNames}
    />
  );
}
