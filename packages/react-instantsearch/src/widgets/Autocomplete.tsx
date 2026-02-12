import {
  createAutocompleteComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompletePromptSuggestionComponent,
  createAutocompletePropGetters,
  createAutocompleteSuggestionComponent,
  createAutocompleteRecentSearchComponent,
  createAutocompleteStorage,
  cx,
} from 'instantsearch-ui-components';
import { warn } from 'instantsearch.js/es/lib/utils';
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

import { Highlight } from './Highlight';
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
import type { TransformItemsIndicesConfig } from 'instantsearch.js/es/connectors/autocomplete/connectAutocomplete';
import type { ChatRenderState } from 'instantsearch.js/es/connectors/chat/connectChat';
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

const AutocompletePromptSuggestion =
  createAutocompletePromptSuggestionComponent({
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

type PanelElements = Partial<Record<string, React.JSX.Element>>;

export type AutocompleteProps<TItem extends BaseHit> = ComponentProps<'div'> & {
  indices?: Array<IndexConfig<TItem>>;
  showQuerySuggestions?: Partial<
    Pick<
      IndexConfig<{ query: string }>,
      | 'indexName'
      | 'getURL'
      | 'headerComponent'
      | 'itemComponent'
      | 'classNames'
      | 'searchParameters'
    >
  >;
  showPromptSuggestions?: Partial<
    Pick<
      IndexConfig<{ query: string; label?: string }>,
      | 'indexName'
      | 'getURL'
      | 'headerComponent'
      | 'itemComponent'
      | 'classNames'
      | 'searchParameters'
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
         * Component to use for the header, before the list of items.
         */
        headerComponent?: AutocompleteIndexProps<{
          query: string;
        }>['HeaderComponent'];

        /**
         * Component to use for each recent search item.
         */
        itemComponent?: AutocompleteIndexProps<{
          query: string;
        }>['ItemComponent'] & {
          onRemoveRecentSearch: () => void;
        };

        classNames?: Partial<AutocompleteIndexClassNames>;
      };
  getSearchPageURL?: (nextUiState: IndexUiState) => string;
  onSelect?: AutocompleteIndexConfig<TItem>['onSelect'];
  transformItems?: (
    indices: TransformItemsIndicesConfig[]
  ) => TransformItemsIndicesConfig[];
  panelComponent?: (props: {
    elements: PanelElements;
    indices: ReturnType<typeof useAutocomplete>['indices'];
  }) => React.JSX.Element;
  searchParameters?: AutocompleteSearchParameters;
  classNames?: Partial<AutocompleteClassNames>;
  placeholder?: string;
};

type InnerAutocompleteProps<TItem extends BaseHit> = Omit<
  AutocompleteProps<TItem>,
  'indices'
> & {
  indicesConfig: Array<IndexConfig<TItem>>;
  refineSearchBox: ReturnType<typeof useSearchBox>['refine'];
  indexUiState: IndexUiState;
  isSearchPage: boolean;
  chatRenderState?: Partial<ChatRenderState>;
  recentSearchConfig?: {
    headerComponent?: AutocompleteIndexProps<{
      query: string;
    }>['HeaderComponent'];
    itemComponent: typeof AutocompleteRecentSearch;
    classNames: Partial<AutocompleteIndexClassNames>;
  };
};

export function EXPERIMENTAL_Autocomplete<TItem extends BaseHit = BaseHit>({
  indices = [],
  showQuerySuggestions,
  showPromptSuggestions,
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
  if (showQuerySuggestions?.indexName) {
    indicesConfig.unshift({
      indexName: showQuerySuggestions.indexName,
      headerComponent:
        showQuerySuggestions.headerComponent as unknown as AutocompleteIndexProps<TItem>['HeaderComponent'],
      itemComponent: (showQuerySuggestions.itemComponent ||
        (({
          item,
          onSelect,
          onApply,
        }: Parameters<typeof AutocompleteSuggestion>[0]) => (
          <AutocompleteSuggestion
            item={item}
            onSelect={onSelect}
            onApply={onApply}
          >
            <ConditionalReverseHighlight
              item={item as unknown as Hit<{ query: string }>}
            />
          </AutocompleteSuggestion>
        ))) as unknown as AutocompleteIndexProps<TItem>['ItemComponent'],
      classNames: {
        root: cx(
          'ais-AutocompleteSuggestions',
          showQuerySuggestions?.classNames?.root
        ),
        list: cx(
          'ais-AutocompleteSuggestionsList',
          showQuerySuggestions?.classNames?.list
        ),
        header: cx(
          'ais-AutocompleteSuggestionsHeader',
          showQuerySuggestions?.classNames?.header
        ),
        item: cx(
          'ais-AutocompleteSuggestionsItem',
          showQuerySuggestions?.classNames?.item
        ),
      },
      searchParameters: {
        hitsPerPage: 3,
        ...showQuerySuggestions.searchParameters,
      },
      getQuery: (item) => item.query,
      getURL:
        showQuerySuggestions.getURL as unknown as IndexConfig<TItem>['getURL'],
    });
  }
  if (showPromptSuggestions?.indexName) {
    indicesConfig.push({
      indexName: showPromptSuggestions.indexName,
      headerComponent:
        showPromptSuggestions.headerComponent as unknown as AutocompleteIndexProps<TItem>['HeaderComponent'],
      itemComponent: (showPromptSuggestions.itemComponent ||
        (({
          item,
          onSelect,
        }: {
          item: {
            query: string;
            label?: string;
            __isPromptSuggestionFallback?: boolean;
          };
          onSelect: () => void;
        }) => (
          <AutocompletePromptSuggestion item={item} onSelect={onSelect}>
            {isPromptSuggestionFallback(item) ? (
              item.label || item.query
            ) : (
              <ConditionalHighlight
                item={item as unknown as Hit<{ query: string }>}
              />
            )}
          </AutocompletePromptSuggestion>
        ))) as unknown as AutocompleteIndexProps<TItem>['ItemComponent'],
      classNames: {
        root: cx(
          'ais-AutocompletePromptSuggestions',
          showPromptSuggestions.classNames?.root
        ),
        list: cx(
          'ais-AutocompletePromptSuggestionsList',
          showPromptSuggestions.classNames?.list
        ),
        header: cx(
          'ais-AutocompletePromptSuggestionsHeader',
          showPromptSuggestions.classNames?.header
        ),
        item: cx(
          'ais-AutocompletePromptSuggestionsItem',
          showPromptSuggestions.classNames?.item
        ),
      },
      searchParameters: {
        hitsPerPage: 3,
        ...showPromptSuggestions.searchParameters,
      },
      getQuery: (item) => item.query,
      getURL:
        showPromptSuggestions.getURL as unknown as IndexConfig<TItem>['getURL'],
    });
  }

  const recentSearchConfig = showRecent
    ? {
        headerComponent:
          typeof showRecent === 'object'
            ? showRecent.headerComponent
            : undefined,
        itemComponent:
          typeof showRecent === 'object' && showRecent.itemComponent
            ? showRecent.itemComponent
            : AutocompleteRecentSearch,
        classNames: {
          root: cx(
            'ais-AutocompleteRecentSearches',
            typeof showRecent === 'object'
              ? showRecent.classNames?.root
              : undefined
          ),
          list: cx(
            'ais-AutocompleteRecentSearchesList',
            typeof showRecent === 'object'
              ? showRecent.classNames?.list
              : undefined
          ),
          header: cx(
            'ais-AutocompleteRecentSearchesHeader',
            typeof showRecent === 'object'
              ? showRecent.classNames?.header
              : undefined
          ),
          item: cx(
            'ais-AutocompleteRecentSearchesItem',
            typeof showRecent === 'object'
              ? showRecent.classNames?.item
              : undefined
          ),
        },
      }
    : undefined;

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
          recentSearchConfig={recentSearchConfig}
          showQuerySuggestions={showQuerySuggestions}
          showPromptSuggestions={showPromptSuggestions}
          chatRenderState={
            indexRenderState.chat as Partial<ChatRenderState> | undefined
          }
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
  panelComponent: PanelComponent,
  showRecent,
  recentSearchConfig,
  showQuerySuggestions,
  showPromptSuggestions,
  chatRenderState,
  transformItems,
  placeholder,
  ...props
}: InnerAutocompleteProps<TItem>) {
  const {
    indices,
    refine: refineAutocomplete,
    currentRefinement,
  } = useAutocomplete({
    transformItems,
  });

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
    suggestionsIndexName: showQuerySuggestions?.indexName,
  });
  const promptSuggestionsIndexName = showPromptSuggestions?.indexName;
  const promptSuggestionsLimit =
    showPromptSuggestions?.searchParameters?.hitsPerPage ?? 3;
  const promptSuggestionsQuery = currentRefinement || '';
  const indicesForPanel = useMemo(
    () =>
      indices.map((index) => {
        const dedupedHits =
          index.indexName === showQuerySuggestions?.indexName && showRecent
            ? index.hits.filter(
                (suggestionHit) =>
                  !storageHits.find(
                    (storageHit) => storageHit.query === suggestionHit.query
                  )
              )
            : index.hits;

        if (index.indexName !== promptSuggestionsIndexName) {
          return {
            ...index,
            hits: dedupedHits,
          };
        }

        return {
          ...index,
          hits: getPromptSuggestionHits({
            hits: dedupedHits as Array<
              { objectID: string } & Record<string, unknown>
            >,
            query: promptSuggestionsQuery,
            limit: promptSuggestionsLimit,
          }),
        };
      }),
    [
      indices,
      promptSuggestionsIndexName,
      promptSuggestionsLimit,
      promptSuggestionsQuery,
      showRecent,
      showQuerySuggestions?.indexName,
      storageHits,
    ]
  );
  const indicesForPropGettersWithPromptSuggestions = useMemo(
    () =>
      indicesForPropGetters.map((index) => {
        if (index.indexName !== promptSuggestionsIndexName) {
          return index;
        }

        return {
          ...index,
          hits: getPromptSuggestionHits({
            hits: index.hits as Array<
              { objectID: string } & Record<string, unknown>
            >,
            query: promptSuggestionsQuery,
            limit: promptSuggestionsLimit,
          }),
        };
      }),
    [
      indicesForPropGetters,
      promptSuggestionsIndexName,
      promptSuggestionsLimit,
      promptSuggestionsQuery,
    ]
  );
  const hasWarnedMissingPromptSuggestionsChatRef = useRef(false);

  const { getInputProps, getItemProps, getPanelProps, getRootProps } =
    usePropGetters<TItem>({
      indices: indicesForPropGettersWithPromptSuggestions,
      indicesConfig: indicesConfigForPropGetters,
      onRefine: (query) => {
        refineAutocomplete(query);
        refineSearchBox(query);
        storage.onAdd(query);
      },
      onApply: (query) => {
        refineAutocomplete(query);
      },
      onSelect:
        userOnSelect ??
        (({ item, query, setQuery, url }) => {
          if (isPromptSuggestion(item)) {
            const chatRenderStateWithFocus = chatRenderState as
              | (Partial<ChatRenderState> & { focusInput?: () => void })
              | undefined;

            if (chatRenderStateWithFocus) {
              chatRenderStateWithFocus.setOpen?.(true);
              chatRenderStateWithFocus.focusInput?.();
              chatRenderStateWithFocus.sendMessage?.({ text: query });
              return;
            }

            if (
              __DEV__ &&
              showPromptSuggestions?.indexName &&
              !hasWarnedMissingPromptSuggestionsChatRef.current
            ) {
              hasWarnedMissingPromptSuggestionsChatRef.current = true;
              warn(
                'showPromptSuggestions requires a Chat widget in the same index to open chat and send messages. Add <Chat /> to enable this behavior.'
              );
            }
          }

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
      placeholder,
    });

  const elements: PanelElements = {};
  if (showRecent && recentSearchConfig) {
    const RecentSearchItemComponent = recentSearchConfig.itemComponent;
    elements.recent = (
      <AutocompleteIndex
        HeaderComponent={
          recentSearchConfig.headerComponent as AutocompleteIndexProps['HeaderComponent']
        }
        // @ts-ignore - there seems to be problems with React.ComponentType and this, but it's actually correct
        ItemComponent={({ item, onSelect, onApply }) => (
          <RecentSearchItemComponent
            item={item as unknown as { query: string }}
            onSelect={onSelect}
            onRemoveRecentSearch={() =>
              storage.onRemove((item as unknown as { query: string }).query)
            }
            onApply={onApply}
          >
            <ConditionalReverseHighlight
              item={item as unknown as Hit<{ query: string }>}
            />
          </RecentSearchItemComponent>
        )}
        classNames={recentSearchConfig.classNames}
        items={storageHits}
        getItemProps={getItemProps}
        key="recentSearches"
      />
    );
  }

  indicesForPanel.forEach(({ indexId, indexName, hits }) => {
    let elementId = indexName;
    if (indexName === showQuerySuggestions?.indexName) {
      elementId = 'suggestions';
    } else if (indexName === showPromptSuggestions?.indexName) {
      elementId = 'promptSuggestions';
    }
    const currentIndexConfig = indicesConfig.find(
      (config) => config.indexName === indexName
    );

    if (!currentIndexConfig) {
      return;
    }

    elements[elementId] = (
      <AutocompleteIndex
        key={indexId}
        // @ts-expect-error - there seems to be problems with React.ComponentType and this, but it's actually correct
        HeaderComponent={currentIndexConfig.headerComponent}
        // @ts-expect-error - there seems to be problems with React.ComponentType and this, but it's actually correct
        ItemComponent={currentIndexConfig.itemComponent}
        items={hits.map((item) => ({
          ...item,
          __indexName: indexId,
        }))}
        getItemProps={getItemProps}
        classNames={currentIndexConfig.classNames}
      />
    );
  });

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
        {PanelComponent ? (
          <PanelComponent
            elements={elements}
            indices={
              indicesForPanel as ReturnType<typeof useAutocomplete>['indices']
            }
          />
        ) : (
          Object.keys(elements).map((elementId) => elements[elementId])
        )}
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

function ConditionalHighlight<TItem extends { query: string }>({
  item,
}: {
  item: Hit<TItem>;
}) {
  if (
    !item._highlightResult?.query ||
    // @ts-expect-error - we should not have matchLevel as arrays here
    item._highlightResult.query.matchLevel === 'none'
  ) {
    return <>{item.query}</>;
  }

  return <Highlight attribute="query" hit={item} />;
}

function getPromptSuggestionHits({
  hits,
  query,
  limit,
}: {
  hits: Array<{ objectID: string } & Record<string, unknown>>;
  query: string;
  limit: number;
}): Array<{ objectID: string } & Record<string, unknown>> {
  const promptHits = hits.slice(0, limit).map((hit) => ({
    ...hit,
    __isPromptSuggestion: true,
  }));

  if (promptHits.length > 0 || query.trim().length === 0) {
    return promptHits;
  }

  return [
    {
      objectID: `ask-about:${encodeURIComponent(query)}`,
      query,
      label: `Ask about "${query}"`,
      __isPromptSuggestion: true,
      __isPromptSuggestionFallback: true,
    },
  ];
}

function isPromptSuggestion(item: unknown): item is {
  query: string;
  __isPromptSuggestion: true;
} {
  return Boolean(
    item &&
      typeof item === 'object' &&
      (item as { __isPromptSuggestion?: boolean }).__isPromptSuggestion
  );
}

function isPromptSuggestionFallback(item: unknown): item is {
  query: string;
  label?: string;
  __isPromptSuggestionFallback: true;
} {
  return Boolean(
    item &&
      typeof item === 'object' &&
      (item as { __isPromptSuggestionFallback?: boolean })
        .__isPromptSuggestionFallback
  );
}
