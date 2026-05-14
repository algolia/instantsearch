import {
  createAutocompleteComponent,
  createAutocompleteDetachedContainerComponent,
  createAutocompleteDetachedOverlayComponent,
  createAutocompleteDetachedFormContainerComponent,
  createAutocompleteDetachedSearchButtonComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompletePromptSuggestionComponent,
  createAutocompletePropGetters,
  createAutocompleteSuggestionComponent,
  createAutocompleteRecentSearchComponent,
  createAutocompleteStorage,
  cx,
  getPromptSuggestionHits,
  isPromptSuggestion,
} from 'instantsearch-ui-components';
import { isChatBusy, openChat } from 'instantsearch.js/es/lib/chat';
import { warn } from 'instantsearch.js/es/lib/utils';
import React, {
  createElement,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Configure,
  Feeds,
  Index,
  useAutocomplete,
  useInstantSearch,
  useInstantSearchContext,
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

const AutocompleteDetachedContainer =
  createAutocompleteDetachedContainerComponent({
    createElement: createElement as Pragma,
    Fragment,
  });

const AutocompleteDetachedOverlay = createAutocompleteDetachedOverlayComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompleteDetachedFormContainer =
  createAutocompleteDetachedFormContainerComponent({
    createElement: createElement as Pragma,
    Fragment,
  });

const AutocompleteDetachedSearchButton =
  createAutocompleteDetachedSearchButtonComponent({
    createElement: createElement as Pragma,
    Fragment,
  });

let id = 0;
const useAutocompleteInstanceId: () => string = React.useId
  ? () => React.useId().replace(/:/g, '')
  : () => React.useState(() => `a${id++}`)[0];
const usePropGetters = createAutocompletePropGetters({
  useEffect,
  useId: React.useId || (() => React.useState(() => (id++).toString())),
  useMemo,
  useRef,
  useState,
});

const useStorage = createAutocompleteStorage({
  useEffect,
  useMemo,
  useState,
});

type AutocompleteSearchParameters = Omit<PlainSearchParameters, 'index'> & {
  hitsPerPage?: number;
};

type IndexConfig<TItem extends BaseHit> = AutocompleteIndexConfig<TItem> & {
  headerComponent?: AutocompleteIndexProps<TItem>['HeaderComponent'];
  itemComponent: AutocompleteIndexProps<TItem>['ItemComponent'];
  noResultsComponent?: AutocompleteIndexProps<TItem>['NoResultsComponent'];
  searchParameters?: AutocompleteSearchParameters;
  classNames?: Partial<AutocompleteIndexClassNames>;
};

type PanelElements = Partial<Record<string, React.JSX.Element>>;

type AutocompleteTranslations = {
  detachedCancelButtonText: string;
  detachedSearchButtonTitle: string;
  detachedClearButtonTitle: string;
};

const DEFAULT_DETACHED_MEDIA_QUERY = '(max-width: 680px)';
const DEFAULT_DETACHED_MODAL_MEDIA_QUERY = '(min-width: 680px)';
const DETACHED_MEDIA_QUERY_CSS_VAR = '--ais-autocomplete-detached-media-query';
const DETACHED_MODAL_MEDIA_QUERY_CSS_VAR =
  '--ais-autocomplete-detached-modal-media-query';
const DEFAULT_TRANSLATIONS: AutocompleteTranslations = {
  detachedCancelButtonText: 'Cancel',
  detachedSearchButtonTitle: 'Search',
  detachedClearButtonTitle: 'Clear',
};

function getCssMediaQueryValue(name: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '';
  }

  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function resolveMediaQuery(
  value: string | undefined,
  cssVarName: string,
  fallback: string
) {
  if (value === '') {
    return '';
  }

  if (value) {
    return value;
  }

  return getCssMediaQueryValue(cssVarName) || fallback;
}

function getMediaQueryList(mediaQuery: string) {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return null;
  }

  return window.matchMedia(mediaQuery);
}

/**
 * Hook to manage detached (mobile) mode state
 */
function useDetachedMode(mediaQuery?: string) {
  const resolvedMediaQuery = useMemo(
    () =>
      resolveMediaQuery(
        mediaQuery,
        DETACHED_MEDIA_QUERY_CSS_VAR,
        DEFAULT_DETACHED_MEDIA_QUERY
      ),
    [mediaQuery]
  );
  const [isDetached, setIsDetached] = useState(() =>
    resolvedMediaQuery
      ? Boolean(getMediaQueryList(resolvedMediaQuery)?.matches)
      : false
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDetached, setIsModalDetached] = useState(false);

  useEffect(() => {
    if (!resolvedMediaQuery) {
      setIsDetached(false);
      return () => {};
    }

    const mql = getMediaQueryList(resolvedMediaQuery);
    if (!mql) {
      setIsDetached(false);
      return () => {};
    }

    const handler = (event: MediaQueryListEvent) => {
      const wasDetached = isDetached;
      setIsDetached(event.matches);
      // Close modal if switching from detached to non-detached
      if (wasDetached && !event.matches) {
        setIsModalOpen(false);
      }
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [resolvedMediaQuery, isDetached]);

  useEffect(() => {
    if (!isDetached) {
      setIsModalDetached(false);
      return () => {};
    }

    const modalMediaQuery = resolveMediaQuery(
      undefined,
      DETACHED_MODAL_MEDIA_QUERY_CSS_VAR,
      DEFAULT_DETACHED_MODAL_MEDIA_QUERY
    );

    if (!modalMediaQuery) {
      setIsModalDetached(false);
      return () => {};
    }

    const mql = getMediaQueryList(modalMediaQuery);
    if (!mql) {
      setIsModalDetached(false);
      return () => {};
    }

    const handler = (event: MediaQueryListEvent) => {
      setIsModalDetached(event.matches);
    };

    setIsModalDetached(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [isDetached]);

  useEffect(() => {
    if (typeof document === 'undefined') return () => {};

    if (isModalOpen) {
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('ais-Autocomplete--detached');

      return () => {
        document.body.classList.remove('ais-Autocomplete--detached');
        document.body.style.top = '';
        window.scrollTo(0, scrollY);
      };
    }

    return () => {};
  }, [isModalOpen]);

  return { isDetached, isModalDetached, isModalOpen, setIsModalOpen };
}

export type FeedConfig<TItem extends BaseHit> = {
  feedID: string;
  headerComponent?: AutocompleteIndexProps<TItem>['HeaderComponent'];
  itemComponent: AutocompleteIndexProps<TItem>['ItemComponent'];
  noResultsComponent?: AutocompleteIndexProps<TItem>['NoResultsComponent'];
  getURL?: AutocompleteIndexConfig<TItem>['getURL'];
  getQuery?: AutocompleteIndexConfig<TItem>['getQuery'];
  classNames?: Partial<AutocompleteIndexClassNames>;
};

type IndicesShowQuerySuggestionsConfig = Partial<
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

type FeedsShowQuerySuggestionsConfig = {
  feedID: string;
  getURL?: IndexConfig<{ query: string }>['getURL'];
  headerComponent?: IndexConfig<{ query: string }>['headerComponent'];
  itemComponent?: IndexConfig<{ query: string }>['itemComponent'];
  classNames?: Partial<AutocompleteIndexClassNames>;
};

type IndicesShowPromptSuggestionsConfig = Partial<
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

type FeedsShowPromptSuggestionsConfig = {
  feedID: string;
  getURL?: IndexConfig<{ query: string; label?: string }>['getURL'];
  headerComponent?: IndexConfig<{ query: string; label?: string }>['headerComponent'];
  itemComponent?: IndexConfig<{ query: string; label?: string }>['itemComponent'];
  classNames?: Partial<AutocompleteIndexClassNames>;
};

type AutocompleteShowRecentConfig = {
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

type AutocompleteCommonProps<TItem extends BaseHit> = ComponentProps<'div'> & {
  showRecent?: boolean | AutocompleteShowRecentConfig;
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
  /**
   * Whether the input should be focused and the panel open initially.
   */
  autoFocus?: boolean;
  /**
   * Media query to enable detached (mobile) mode.
   * When the media query matches, the autocomplete switches to a full-screen overlay.
   * Set to empty string to disable detached mode.
   * When omitted, defaults to `--ais-autocomplete-detached-media-query`.
   * @default "(max-width: 680px)"
   */
  detachedMediaQuery?: string;
  /**
   * Translations for the Autocomplete widget.
   */
  translations?: Partial<AutocompleteTranslations>;
  /**
   * When true, renders an AI mode button inside the search input
   * that opens the Chat widget and sends the current query.
   * Requires a Chat widget on the same index.
   */
  aiMode?: boolean;
};

export type AutocompleteIndicesProps<TItem extends BaseHit> =
  AutocompleteCommonProps<TItem> & {
    indices?: Array<IndexConfig<TItem>>;
    feeds?: never;
    showQuerySuggestions?: IndicesShowQuerySuggestionsConfig;
    showPromptSuggestions?: IndicesShowPromptSuggestionsConfig;
  };

export type AutocompleteFeedsProps<TItem extends BaseHit> =
  AutocompleteCommonProps<TItem> & {
    feeds: Array<FeedConfig<TItem>>;
    indices?: never;
    showQuerySuggestions?: FeedsShowQuerySuggestionsConfig;
    showPromptSuggestions?: FeedsShowPromptSuggestionsConfig;
  };

export type AutocompleteProps<TItem extends BaseHit> =
  | AutocompleteIndicesProps<TItem>
  | AutocompleteFeedsProps<TItem>;

type InnerAutocompleteProps<TItem extends BaseHit> = Omit<
  AutocompleteIndicesProps<TItem>,
  'indices' | 'translations' | 'feeds'
> & {
  indicesConfig: Array<IndexConfig<TItem>>;
  refineSearchBox: ReturnType<typeof useSearchBox>['refine'];
  isSearchStalled: boolean;
  indexUiState: IndexUiState;
  isSearchPage: boolean;
  translations: AutocompleteTranslations;
  chatRenderState?: Partial<ChatRenderState>;
  recentSearchConfig?: {
    headerComponent?: AutocompleteIndexProps<{
      query: string;
    }>['HeaderComponent'];
    itemComponent: typeof AutocompleteRecentSearch;
    classNames: Partial<AutocompleteIndexClassNames>;
  };
};

export function EXPERIMENTAL_Autocomplete<TItem extends BaseHit = BaseHit>(
  props: AutocompleteProps<TItem>
) {
  const indices = 'indices' in props ? props.indices : undefined;
  const feeds = 'feeds' in props ? props.feeds : undefined;
  const isFeedsMode = feeds !== undefined;
  const {
    showQuerySuggestions,
    showPromptSuggestions,
    showRecent,
    searchParameters: userSearchParameters,
    detachedMediaQuery,
    translations: userTranslations = {},
    transformItems,
    ...restProps
  } = props;
  const translations: AutocompleteTranslations = {
    ...DEFAULT_TRANSLATIONS,
    ...userTranslations,
  };
  const { indexUiState, indexRenderState, status } = useInstantSearch();
  const { compositionID } = useInstantSearchContext();
  const { refine } = useSearchBox(
    {},
    { $$type: 'ais.autocomplete', $$widgetType: 'ais.autocomplete' }
  );
  // In feeds-mode, indexId disambiguates multiple Autocomplete instances
  // sharing the same compositionID. Mirrors the fallback at line 111 for React <18.
  const instanceKey = useAutocompleteInstanceId();

  if (isFeedsMode && indices !== undefined) {
    throw new Error(
      'EXPERIMENTAL_Autocomplete: `feeds` and `indices` are mutually exclusive.'
    );
  }
  if (isFeedsMode && !compositionID) {
    throw new Error(
      'EXPERIMENTAL_Autocomplete in feeds-mode requires a composition-based <InstantSearch> (compositionID must be set).'
    );
  }

  const isSearchStalled = status === 'stalled';
  const searchParameters = {
    hitsPerPage: 5,
    ...userSearchParameters,
  };

  // In feeds-mode `indexName` carries the feedID so downstream matching
  // (section building, dedupe in createAutocompleteStorage) treats feeds
  // like indices without any changes to InnerAutocomplete.
  const querySuggestionsKey = isFeedsMode
    ? (showQuerySuggestions as FeedsShowQuerySuggestionsConfig | undefined)
        ?.feedID
    : (showQuerySuggestions as IndicesShowQuerySuggestionsConfig | undefined)
        ?.indexName;
  const promptSuggestionsKey = isFeedsMode
    ? (showPromptSuggestions as FeedsShowPromptSuggestionsConfig | undefined)
        ?.feedID
    : (showPromptSuggestions as IndicesShowPromptSuggestionsConfig | undefined)
        ?.indexName;

  const indicesConfig = useMemo((): Array<IndexConfig<TItem>> => {
    const config: Array<IndexConfig<TItem>> = isFeedsMode
      ? feeds.map((feed) => ({
          indexName: feed.feedID,
          headerComponent: feed.headerComponent,
          itemComponent: feed.itemComponent,
          noResultsComponent: feed.noResultsComponent,
          getURL: feed.getURL,
          getQuery: feed.getQuery,
          classNames: feed.classNames,
        }))
      : [...(indices ?? [])];
    if (querySuggestionsKey) {
      const querySuggestionsSearchParameters = isFeedsMode
        ? undefined
        : {
            hitsPerPage: 3,
            ...(showQuerySuggestions as IndicesShowQuerySuggestionsConfig)
              .searchParameters,
          };
      config.unshift({
        indexName: querySuggestionsKey,
        headerComponent: showQuerySuggestions!
          .headerComponent as unknown as AutocompleteIndexProps<TItem>['HeaderComponent'],
        itemComponent: (showQuerySuggestions!.itemComponent ||
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
        searchParameters: querySuggestionsSearchParameters,
        getQuery: (item) => item.query,
        getURL: showQuerySuggestions!
          .getURL as unknown as IndexConfig<TItem>['getURL'],
      });
    }
    if (promptSuggestionsKey) {
      const promptSuggestionsSearchParameters = isFeedsMode
        ? undefined
        : {
            hitsPerPage: 3,
            ...(showPromptSuggestions as IndicesShowPromptSuggestionsConfig)
              .searchParameters,
          };
      config.push({
        indexName: promptSuggestionsKey,
        headerComponent: showPromptSuggestions!
          .headerComponent as unknown as AutocompleteIndexProps<TItem>['HeaderComponent'],
        itemComponent: (showPromptSuggestions!.itemComponent ||
          (({
            item,
            onSelect,
          }: {
            item: {
              prompt: string;
              label?: string;
            };
            onSelect: () => void;
          }) => (
            <AutocompletePromptSuggestion item={item} onSelect={onSelect}>
              <ConditionalHighlight
                item={item as unknown as Hit<{ prompt: string }>}
                attribute="prompt"
              />
            </AutocompletePromptSuggestion>
          ))) as unknown as AutocompleteIndexProps<TItem>['ItemComponent'],
        classNames: {
          root: cx(
            'ais-AutocompletePromptSuggestions',
            showPromptSuggestions?.classNames?.root
          ),
          list: cx(
            'ais-AutocompletePromptSuggestionsList',
            showPromptSuggestions?.classNames?.list
          ),
          header: cx(
            'ais-AutocompletePromptSuggestionsHeader',
            showPromptSuggestions?.classNames?.header
          ),
          item: cx(
            'ais-AutocompletePromptSuggestionsItem',
            showPromptSuggestions?.classNames?.item
          ),
        },
        searchParameters: promptSuggestionsSearchParameters,
        getQuery: (item) => item.prompt,
        getURL: showPromptSuggestions!
          .getURL as unknown as IndexConfig<TItem>['getURL'],
      });
    }
    return config;
  }, [
    feeds,
    indices,
    isFeedsMode,
    promptSuggestionsKey,
    querySuggestionsKey,
    showPromptSuggestions,
    showQuerySuggestions,
  ]);

  // Normalize `show*` for InnerAutocomplete: always surface `indexName`
  // (in feeds-mode it carries the feedID). Keeps downstream dedupe in
  // createAutocompleteStorage (suggestionsIndexName === index.indexName) working.
  const normalizedShowQuerySuggestions = useMemo(():
    | IndicesShowQuerySuggestionsConfig
    | undefined => {
    if (!showQuerySuggestions) {
      return undefined;
    }
    if (isFeedsMode) {
      return {
        ...showQuerySuggestions,
        indexName: querySuggestionsKey,
      } as IndicesShowQuerySuggestionsConfig;
    }
    return showQuerySuggestions as IndicesShowQuerySuggestionsConfig;
  }, [isFeedsMode, querySuggestionsKey, showQuerySuggestions]);

  const normalizedShowPromptSuggestions = useMemo(():
    | IndicesShowPromptSuggestionsConfig
    | undefined => {
    if (!showPromptSuggestions) {
      return undefined;
    }
    if (isFeedsMode) {
      return {
        ...showPromptSuggestions,
        indexName: promptSuggestionsKey,
      } as IndicesShowPromptSuggestionsConfig;
    }
    return showPromptSuggestions as IndicesShowPromptSuggestionsConfig;
  }, [isFeedsMode, promptSuggestionsKey, showPromptSuggestions]);

  // In feeds-mode, remap `indexName := indexId` so downstream storage (which
  // matches on indexName) sees feedIDs instead of the composition index name
  // that connectAutocomplete sets from the helper results.
  // Must be memoized: useConnector's useStableValue runs dequal on each render
  // and treats a new function identity as a change, re-registering the widget.
  const effectiveTransformItems = useMemo(
    () =>
      isFeedsMode
        ? (items: TransformItemsIndicesConfig[]) => {
            const remapped = items.map((item) => ({
              ...item,
              indexName: item.indexId,
            }));
            return transformItems ? transformItems(remapped) : remapped;
          }
        : transformItems,
    [isFeedsMode, transformItems]
  );

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

  const {
    indices: _unusedIndices,
    feeds: _unusedFeeds,
    ...forwardedProps
  } = restProps as Record<string, unknown>;

  const innerAutocomplete = (
    <InnerAutocomplete
      {...(forwardedProps as Omit<
        AutocompleteIndicesProps<TItem>,
        | 'indices'
        | 'feeds'
        | 'showQuerySuggestions'
        | 'showPromptSuggestions'
        | 'showRecent'
        | 'searchParameters'
        | 'detachedMediaQuery'
        | 'translations'
        | 'transformItems'
      >)}
      indicesConfig={indicesConfig}
      refineSearchBox={refine}
      isSearchStalled={isSearchStalled}
      indexUiState={indexUiState}
      isSearchPage={isSearchPage}
      showRecent={showRecent}
      recentSearchConfig={recentSearchConfig}
      showQuerySuggestions={normalizedShowQuerySuggestions}
      detachedMediaQuery={detachedMediaQuery}
      translations={translations}
      showPromptSuggestions={normalizedShowPromptSuggestions}
      transformItems={effectiveTransformItems}
      chatRenderState={
        indexRenderState.chat as Partial<ChatRenderState> | undefined
      }
    />
  );

  if (isFeedsMode) {
    return (
      <Index
        EXPERIMENTAL_isolated
        indexName={compositionID}
        indexId={`ais-autocomplete-${instanceKey}`}
      >
        <Configure {...searchParameters} />
        <Feeds isolated={false} renderFeed={() => null} />
        {innerAutocomplete}
      </Index>
    );
  }

  return (
    <Index EXPERIMENTAL_isolated>
      <Configure {...searchParameters} />
      {indicesConfig.map((index) => (
        <Index key={index.indexName} indexName={index.indexName}>
          <Configure {...index.searchParameters} />
        </Index>
      ))}
      {innerAutocomplete}
    </Index>
  );
}

function InnerAutocomplete<TItem extends BaseHit = BaseHit>({
  indicesConfig,
  refineSearchBox,
  isSearchStalled,
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
  autoFocus,
  detachedMediaQuery = DEFAULT_DETACHED_MEDIA_QUERY,
  translations,
  classNames,
  aiMode,
  ...props
}: InnerAutocompleteProps<TItem>) {
  const {
    indices,
    refine: refineAutocomplete,
    currentRefinement,
  } = useAutocomplete({
    transformItems,
    future: { undefinedEmptyQuery: true },
  });

  const resolvedQuery =
    currentRefinement !== undefined
      ? currentRefinement
      : indexUiState.query ?? '';

  const { isDetached, isModalDetached, isModalOpen, setIsModalOpen } =
    useDetachedMode(detachedMediaQuery);
  const previousIsDetachedRef = useRef(isDetached);

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
            limit: promptSuggestionsLimit,
          }),
        };
      }),
    [
      indices,
      promptSuggestionsIndexName,
      promptSuggestionsLimit,
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
            limit: promptSuggestionsLimit,
          }),
        };
      }),
    [indicesForPropGetters, promptSuggestionsIndexName, promptSuggestionsLimit]
  );
  const hasWarnedMissingPromptSuggestionsChatRef = useRef(false);

  const allIndicesEmpty = indicesForPanel.every(
    ({ hits }) => hits.length === 0
  );
  const recentEmpty = !storageHits || storageHits.length === 0;
  const hasNoResultsTemplate = indicesConfig.some(
    (c) => c.noResultsComponent !== undefined
  );
  const shouldHideEmptyPanel =
    allIndicesEmpty && recentEmpty && !hasNoResultsTemplate && !PanelComponent;

  const {
    getInputProps,
    getItemProps,
    getPanelProps,
    getRootProps,
    isOpen,
    setIsOpen,
    focusInput,
  } = usePropGetters<TItem>({
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
          if (chatRenderState) {
            if (openChat(chatRenderState, { message: item.prompt })) {
              setQuery('');
            }
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
    onSubmit: () => {
      // Close the detached modal when form is submitted
      if (isDetached) {
        setIsModalOpen(false);
      }
    },
    placeholder,
    isDetached,
    shouldHidePanel: shouldHideEmptyPanel,
    autoFocus,
  });

  // Open panel and focus input when modal opens
  useEffect(() => {
    if (isDetached && isModalOpen) {
      setIsOpen(true);
      // Focus input to show the keyboard on mobile
      focusInput();
    }
  }, [isDetached, isModalOpen, setIsOpen, focusInput]);

  // Keep the modal open if the panel was open before switching to detached
  useEffect(() => {
    const wasDetached = previousIsDetachedRef.current;
    const switchedToDetached = !wasDetached && isDetached;

    if (switchedToDetached && isOpen) {
      setIsModalOpen(true);
    }

    previousIsDetachedRef.current = isDetached;
  }, [isDetached, isOpen, setIsModalOpen]);

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

  indicesForPanel.forEach(({ indexId, indexName, hits, sendEvent }) => {
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
        NoResultsComponent={currentIndexConfig.noResultsComponent}
        items={hits.map((item) => ({
          ...item,
          __indexName: indexId,
        }))}
        getItemProps={getItemProps}
        sendEvent={sendEvent}
        classNames={currentIndexConfig.classNames}
      />
    );
  });

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsOpen(false);
  };

  const searchBoxContent = (
    <AutocompleteSearch
      inputProps={getInputProps()}
      clearQuery={() => {
        refineSearchBox('');
        refineAutocomplete('');
      }}
      onQueryChange={(query) => {
        refineAutocomplete(query);
      }}
      query={resolvedQuery}
      isSearchStalled={isSearchStalled}
      onCancel={() => {
        if (isDetached) {
          handleCancel();
        }
      }}
      isDetached={isDetached}
      submitTitle={
        isDetached ? translations.detachedCancelButtonText : undefined
      }
      onAiModeClick={
        aiMode
          ? () => {
              setIsOpen(false);
              if (isDetached) {
                setIsModalOpen(false);
              }
              if (openChat(chatRenderState, { message: resolvedQuery })) {
                refineSearchBox('');
                refineAutocomplete('');
              }
            }
          : undefined
      }
      aiModeButtonDisabled={aiMode ? isChatBusy(chatRenderState) : undefined}
      classNames={classNames}
    />
  );

  const panelContent = (
    <AutocompletePanel
      {...getPanelProps()}
      classNames={{ root: classNames?.panel, open: classNames?.panelOpen, layout: classNames?.panelLayout }}
    >
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
  );
  const detachedContainerClassNames = isModalDetached
    ? {
        ...classNames,
        detachedContainer: cx(
          'ais-AutocompleteDetachedContainer--modal',
          classNames?.detachedContainer
        ),
      }
    : classNames;
  const { ref: rootRef, ...rootProps } = getRootProps();

  if (isDetached) {
    return (
      <Autocomplete
        {...props}
        {...rootProps}
        rootRef={rootRef}
        classNames={classNames}
      >
        <AutocompleteDetachedSearchButton
          query={resolvedQuery}
          placeholder={placeholder}
          classNames={classNames}
          onClick={() => {
            setIsModalOpen(true);
            setIsOpen(true);
          }}
          onClear={() => {
            refineSearchBox('');
            refineAutocomplete('');
          }}
          translations={translations}
        />
        {isModalOpen && (
          <AutocompleteDetachedOverlay
            classNames={classNames}
            onClose={handleCancel}
          >
            <AutocompleteDetachedContainer
              classNames={detachedContainerClassNames}
            >
              <AutocompleteDetachedFormContainer
                classNames={classNames}
              >
                {searchBoxContent}
              </AutocompleteDetachedFormContainer>
              {panelContent}
            </AutocompleteDetachedContainer>
          </AutocompleteDetachedOverlay>
        )}
      </Autocomplete>
    );
  }

  // Normal (non-detached) rendering
  return (
    <Autocomplete
      {...props}
      {...rootProps}
      rootRef={rootRef}
      classNames={classNames}
    >
      {searchBoxContent}
      {panelContent}
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

function ConditionalHighlight<
  TItem extends BaseHit,
  TAttribute extends keyof TItem & string = keyof TItem & string
>({
  item,
  attribute = 'query' as TAttribute,
}: {
  item: Hit<TItem>;
  attribute?: TAttribute;
}) {
  if (
    !item._highlightResult?.[attribute] ||
    // @ts-expect-error - we should not have matchLevel as arrays here
    item._highlightResult[attribute].matchLevel === 'none'
  ) {
    return <>{item[attribute]}</>;
  }

  return <Highlight attribute={attribute} hit={item} />;
}
