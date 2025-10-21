import {
  createAutocompleteComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompleteSuggestionComponent,
  cx,
} from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';
import { Index, useHits, useSearchBox } from 'react-instantsearch-core';

import { SearchBox } from '../widgets/SearchBox';

import { useAutocomplete } from './useAutocomplete';

import type { IndexConfig as UseAutocompleteIndexConfig } from './useAutocomplete';
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

type ItemComponentProps<TItem extends BaseHit> = React.ComponentType<{
  item: Hit<TItem>;
  onSelect: () => void;
}>;

type IndexConfig<TItem extends BaseHit> = UseAutocompleteIndexConfig<TItem> & {
  itemComponent: ItemComponentProps<TItem>;
  classNames?: Partial<AutocompleteIndexClassNames>;
};

export type AutocompleteProps<TItem extends BaseHit> = {
  indices?: Array<IndexConfig<TItem>>;
  showSuggestions?: Partial<
    Pick<
      IndexConfig<{ query: string }>,
      'indexName' | 'itemComponent' | 'classNames'
    >
  >;
};

function VirtualSearchBox() {
  useSearchBox();
  return null;
}

export function EXPERIMENTAL_Autocomplete<TItem extends BaseHit = BaseHit>({
  indices: userIndices = [],
  showSuggestions,
}: AutocompleteProps<TItem>) {
  const indices = [...userIndices];
  if (showSuggestions?.indexName) {
    indices.unshift({
      indexName: showSuggestions.indexName,
      // Temporarily force casting until the coming refactoring
      itemComponent: (showSuggestions.itemComponent ||
        AutocompleteSuggestion) as unknown as ItemComponentProps<TItem>,
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

  const {
    getIndexProps,
    getInputProps,
    getItemProps,
    getPanelProps,
    getRootProps,
  } = useAutocomplete({ indices });

  return (
    <Fragment>
      <VirtualSearchBox />
      <Index EXPERIMENTAL_isolated {...getIndexProps()}>
        <Autocomplete {...getRootProps()}>
          <SearchBox inputProps={getInputProps()} />
          <AutocompletePanel {...getPanelProps()}>
            {indices.map((index) => (
              <Index key={index.indexName} indexName={index.indexName}>
                <AutocompleteIndexComponent<TItem>
                  {...index}
                  getItemProps={getItemProps}
                />
              </Index>
            ))}
          </AutocompletePanel>
        </Autocomplete>
      </Index>
    </Fragment>
  );
}

function AutocompleteIndexComponent<TItem extends BaseHit>({
  indexName,
  itemComponent: ItemComponent,
  getItemProps,
  classNames,
}: IndexConfig<TItem> &
  Pick<ReturnType<typeof useAutocomplete>, 'getItemProps'>) {
  const { items } = useHits<TItem>();

  return (
    <AutocompleteIndex
      // @ts-expect-error - there seems to be problems with React.ComponentType and this, but it's actually correct
      ItemComponent={ItemComponent}
      items={items.map((item) => ({
        ...item,
        __indexName: indexName,
      }))}
      getItemProps={getItemProps}
      classNames={classNames}
    />
  );
}
