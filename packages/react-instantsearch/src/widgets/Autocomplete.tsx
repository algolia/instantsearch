import {
  createAutocompleteComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompletePropGetters,
  createAutocompleteSuggestionComponent,
  createAutocompleteRecentSearchComponent,
  createAutocompleteStorage,
  cx,
} from 'instantsearch-ui-components';
import React, {
  createElement,
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Configure,
  Index,
  useAutocomplete,
  useInstantSearch,
  useSearchBox,
} from 'react-instantsearch-core';

import { AutocompleteSearch } from '../components/AutocompleteSearch';

import { ReverseHighlight } from './ReverseHighlight';

import type { PlainSearchParameters } from 'algoliasearch-helper';
import type {
  AutocompleteIndexClassNames,
  AutocompleteIndexConfig,
  Pragma,
  AutocompleteClassNames,
  AutocompleteIndexProps,
} from 'instantsearch-ui-components';
import type { BaseHit, Hit, IndexUiState } from 'instantsearch.js';
import type { ComponentProps } from 'react';

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

const usePropGetters = createAutocompletePropGetters({
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
});

const useStorage = createAutocompleteStorage({
  useEffect,
  useMemo,
  useState,
});

type AutocompleteSearchParameters = Omit<PlainSearchParameters, 'index'>;

type IndexConfig<TItem extends BaseHit> = AutocompleteIndexConfig<TItem> & {
  headerComponent?: AutocompleteIndexProps<TItem>['HeaderComponent'];
  itemComponent: AutocompleteIndexProps<TItem>['ItemComponent'];
  searchParameters?: AutocompleteSearchParameters;
  classNames?: Partial<AutocompleteIndexClassNames>;
};

export type AutocompleteProps<TItem extends BaseHit> = ComponentProps<'div'> & {
  indices?: Array<IndexConfig<TItem>>;
  showSuggestions?: Partial<
    Pick<
      IndexConfig<{ query: string }>,
      | 'indexName'
      | 'getURL'
      | 'headerComponent'
      | 'itemComponent'
      | 'classNames'
    >
  >;
  showRecent?:
    | boolean
    | {
        /**
         * Storage key to use in the local storage.
         */
        storageKey?: string;

        /**
         * Component to use for each recent search item.
         */
        itemComponent: AutocompleteIndexProps<{
          query: string;
        }>['ItemComponent'] & {
          onRemoveRecentSearch: () => void;
        };
      };
  getSearchPageURL?: (nextUiState: IndexUiState) => string;
  onSelect?: AutocompleteIndexConfig<TItem>['onSelect'];
  searchParameters?: AutocompleteSearchParameters;
  classNames?: Partial<AutocompleteClassNames>;
};

type InnerAutocompleteProps<TItem extends BaseHit> = Omit<
  AutocompleteProps<TItem>,
  'indices' | 'showSuggestions'
> & {
  indicesConfig: Array<IndexConfig<TItem>>;
  refineSearchBox: ReturnType<typeof useSearchBox>['refine'];
  indexUiState: IndexUiState;
  isSearchPage: boolean;
  showRecent: AutocompleteProps<TItem>['showRecent'];
};

export function EXPERIMENTAL_Autocomplete<TItem extends BaseHit = BaseHit>({
  indices = [],
  showSuggestions,
  showRecent,
  searchParameters: userSearchParameters,
  ...props
}: AutocompleteProps<TItem>) {
  const { indexUiState, indexRenderState } = useInstantSearch();
  const { refine } = useSearchBox(
    {},
    { $$type: 'ais.autocomplete', $$widgetType: 'ais.autocomplete' }
  );
  const searchParameters = {
    hitsPerPage: 5,
    ...userSearchParameters,
  };
  const indicesConfig = [...indices];
  if (showSuggestions?.indexName) {
    indicesConfig.unshift({
      indexName: showSuggestions.indexName,
      headerComponent:
        showSuggestions.headerComponent as unknown as AutocompleteIndexProps<TItem>['HeaderComponent'],
      itemComponent: (showSuggestions.itemComponent ||
        (({ item, onSelect }: Parameters<typeof AutocompleteSuggestion>[0]) => (
          <AutocompleteSuggestion item={item} onSelect={onSelect}>
            <ConditionalReverseHighlight
              item={item as unknown as Hit<{ query: string }>}
            />
          </AutocompleteSuggestion>
        ))) as unknown as AutocompleteIndexProps<TItem>['ItemComponent'],
      classNames: {
        root: cx(
          'ais-AutocompleteSuggestions',
          showSuggestions?.classNames?.root
        ),
        list: cx(
          'ais-AutocompleteSuggestionsList',
          showSuggestions?.classNames?.list
        ),
        header: cx(
          'ais-AutocompleteSuggestionsHeader',
          showSuggestions?.classNames?.header
        ),
        item: cx(
          'ais-AutocompleteSuggestionsItem',
          showSuggestions?.classNames?.item
        ),
      },
      getQuery: (item) => item.query,
      getURL: showSuggestions.getURL as unknown as IndexConfig<TItem>['getURL'],
    });
  }

  const isSearchPage = useMemo(
    () =>
      typeof indexRenderState.hits !== 'undefined' ||
      typeof indexRenderState.infiniteHits !== 'undefined',
    [indexRenderState]
  );

  return (
    <Fragment>
      <Index EXPERIMENTAL_isolated>
        <Configure {...searchParameters} />
        {indicesConfig.map((index) => (
          <Index key={index.indexName} indexName={index.indexName}>
            <Configure {...index.searchParameters} />
          </Index>
        ))}
        <InnerAutocomplete
          {...props}
          indicesConfig={indicesConfig}
          refineSearchBox={refine}
          indexUiState={indexUiState}
          isSearchPage={isSearchPage}
          showRecent={showRecent}
        />
      </Index>
    </Fragment>
  );
}

function InnerAutocomplete<TItem extends BaseHit = BaseHit>({
  indicesConfig,
  refineSearchBox,
  getSearchPageURL,
  onSelect: userOnSelect,
  indexUiState,
  isSearchPage,
  showRecent,
  ...props
}: InnerAutocompleteProps<TItem>) {
  const {
    indices,
    refine: refineAutocomplete,
    currentRefinement,
  } = useAutocomplete();

  const {
    storage,
    storageHits,
    indicesForPropGetters,
    indicesConfigForPropGetters,
  } = useStorage<TItem>({
    showRecent,
    query: currentRefinement,
    indices,
    indicesConfig,
  });

  const { getInputProps, getItemProps, getPanelProps, getRootProps } =
    usePropGetters<TItem>({
      indices: indicesForPropGetters,
      indicesConfig: indicesConfigForPropGetters,
      onRefine: (query) => {
        refineAutocomplete(query);
        refineSearchBox(query);
        storage.onAdd(query);
      },
      onSelect:
        userOnSelect ??
        (({ query, setQuery, url }) => {
          if (url) {
            window.location.href = url;
            return;
          }

          if (!isSearchPage && typeof getSearchPageURL !== 'undefined') {
            window.location.href = getSearchPageURL({ ...indexUiState, query });
            return;
          }

          setQuery(query);
        }),
    });

  const AutocompleteRecentSearchComponent =
    (typeof showRecent === 'object' && showRecent.itemComponent) ||
    AutocompleteRecentSearch;

  return (
    <Autocomplete {...props} {...getRootProps()}>
      <AutocompleteSearch
        inputProps={getInputProps()}
        clearQuery={() => {
          refineSearchBox('');
          refineAutocomplete('');
        }}
      />
      <AutocompletePanel {...getPanelProps()}>
        {showRecent && (
          <AutocompleteIndex
            // @ts-ignore - there seems to be problems with React.ComponentType and this, but it's actually correct
            ItemComponent={({ item, onSelect }) => (
              <AutocompleteRecentSearchComponent
                item={item as unknown as { query: string }}
                onSelect={onSelect}
                onRemoveRecentSearch={() =>
                  storage.onRemove((item as unknown as { query: string }).query)
                }
              >
                <ConditionalReverseHighlight
                  item={item as unknown as Hit<{ query: string }>}
                />
              </AutocompleteRecentSearchComponent>
            )}
            classNames={{
              root: 'ais-AutocompleteRecentSearches',
              list: 'ais-AutocompleteRecentSearchesList',
              item: 'ais-AutocompleteRecentSearchesItem',
            }}
            items={storageHits}
            getItemProps={getItemProps}
          />
        )}
        {indices.map(({ indexId, hits }, index) => (
          <AutocompleteIndex
            key={indexId}
            // @ts-expect-error - there seems to be problems with React.ComponentType and this, but it's actually correct
            HeaderComponent={indicesConfig[index].headerComponent}
            // @ts-expect-error - there seems to be problems with React.ComponentType and this, but it's actually correct
            ItemComponent={indicesConfig[index].itemComponent}
            items={hits.map((item) => ({
              ...item,
              __indexName: indexId,
            }))}
            getItemProps={getItemProps}
            classNames={indicesConfig[index].classNames}
          />
        ))}
      </AutocompletePanel>
    </Autocomplete>
  );
}

function ConditionalReverseHighlight<TItem extends { query: string }>({
  item,
}: {
  item: Hit<TItem>;
}) {
  if (
    !item._highlightResult?.query ||
    // @ts-expect-error - we should not have matchLevel as arrays here
    item._highlightResult.query.matchLevel === 'none'
  ) {
    return item.query;
  }

  return <ReverseHighlight attribute="query" hit={item} />;
}
