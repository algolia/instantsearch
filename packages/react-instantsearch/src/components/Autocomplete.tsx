import {
  createAutocompleteComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompleteSuggestionComponent,
  cx,
} from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import {
  Index,
  useHits,
  useInstantSearch,
  useSearchBox,
} from 'react-instantsearch-core';

import { SearchBox } from '../widgets/SearchBox';

import { useAutocomplete } from './useAutocomplete';

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

type ItemComponentProps<TItem> = React.ComponentType<{
  item: TItem;
  onSelect: () => void;
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
    classNames?: IndexConfig['classNames'];
  };
};

function VirtualSearchBox() {
  useSearchBox();
  return null;
}

export function EXPERIMENTAL_Autocomplete({
  indices: userIndices = [],
  showSuggestions,
}: AutocompleteProps) {
  const {
    getIndexProps,
    getInputProps,
    getItemProps,
    getPanelProps,
    getRootProps,
    updateStore,
  } = useAutocomplete();
  const { setIndexUiState } = useInstantSearch();

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

  return (
    <Fragment>
      <VirtualSearchBox />
      <Index EXPERIMENTAL_isolated {...getIndexProps()}>
        <Autocomplete {...getRootProps()}>
          <SearchBox inputProps={getInputProps()} />
          <AutocompletePanel {...getPanelProps()}>
            {indices.map((index) => (
              <Index key={index.indexName} indexName={index.indexName}>
                <AutocompleteIndexComponent
                  {...index}
                  setQuery={(query) => {
                    setIndexUiState((state) => ({ ...state, query }));
                  }}
                  getItemProps={getItemProps}
                  updateStore={updateStore}
                />
              </Index>
            ))}
          </AutocompletePanel>
        </Autocomplete>
      </Index>
    </Fragment>
  );
}

function AutocompleteIndexComponent({
  indexName,
  itemComponent: ItemComponent,
  onSelect: userOnSelect,
  getItemProps,
  getQuery,
  getURL,
  setQuery,
  updateStore,
  classNames,
}: IndexConfig &
  Pick<ReturnType<typeof useAutocomplete>, 'getItemProps' | 'updateStore'> & {
    setQuery: (query: string) => void;
  }) {
  const { items } = useHits();
  const onSelect: Parameters<typeof AutocompleteIndex>['0']['onSelect'] = (
    item
  ) => {
    userOnSelect?.({
      item,
      getQuery: () => getQuery?.(item) || '',
      getURL: () => getURL?.(item) || '',
      setQuery,
    });
  };

  updateStore({ indexName, items, onSelect, getQuery, getURL });

  return (
    <AutocompleteIndex
      // @ts-expect-error - there seems to be problems with React.ComponentType and this, but it's actually correct
      ItemComponent={ItemComponent}
      items={items.map((item) => ({
        ...item,
        __indexName: indexName,
      }))}
      getItemProps={getItemProps}
      onSelect={onSelect}
      classNames={classNames}
    />
  );
}
