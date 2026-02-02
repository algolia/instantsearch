import {
  createAutocompleteComponent,
  createAutocompleteDetachedContainerComponent,
  createAutocompleteDetachedOverlayComponent,
  createAutocompleteDetachedFormContainerComponent,
  createAutocompleteDetachedSearchButtonComponent,
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
import type { TransformItemsIndicesConfig } from 'instantsearch.js/es/connectors/autocomplete/connectAutocomplete';
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

type PanelElements = Partial<
  // eslint-disable-next-line @typescript-eslint/ban-types
  Record<'recent' | 'suggestions' | (string & {}), React.JSX.Element>
>;

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
    typeof window !== 'undefined' && resolvedMediaQuery
      ? window.matchMedia(resolvedMediaQuery).matches
      : false
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDetached, setIsModalDetached] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !resolvedMediaQuery) {
      setIsDetached(false);
      return () => {};
    }

    const mql = window.matchMedia(resolvedMediaQuery);
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
    if (!isDetached || typeof window === 'undefined') {
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

    const mql = window.matchMedia(modalMediaQuery);
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
};

type InnerAutocompleteProps<TItem extends BaseHit> = Omit<
  AutocompleteProps<TItem>,
  'indices' | 'translations'
> & {
  indicesConfig: Array<IndexConfig<TItem>>;
  refineSearchBox: ReturnType<typeof useSearchBox>['refine'];
  isSearchStalled: boolean;
  indexUiState: IndexUiState;
  isSearchPage: boolean;
  translations: AutocompleteTranslations;
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
  showSuggestions,
  showRecent,
  searchParameters: userSearchParameters,
  detachedMediaQuery,
  translations: userTranslations = {},
  ...props
}: AutocompleteProps<TItem>) {
  const translations: AutocompleteTranslations = {
    ...DEFAULT_TRANSLATIONS,
    ...userTranslations,
  };
  const { indexUiState, indexRenderState, status } = useInstantSearch();
  const { refine } = useSearchBox(
    {},
    { $$type: 'ais.autocomplete', $$widgetType: 'ais.autocomplete' }
  );
  const isSearchStalled = status === 'stalled';
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
          isSearchStalled={isSearchStalled}
          indexUiState={indexUiState}
          isSearchPage={isSearchPage}
          showRecent={showRecent}
          recentSearchConfig={recentSearchConfig}
          showSuggestions={showSuggestions}
          detachedMediaQuery={detachedMediaQuery}
          translations={translations}
        />
      </Index>
    </Fragment>
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
  showSuggestions,
  transformItems,
  placeholder,
  detachedMediaQuery = DEFAULT_DETACHED_MEDIA_QUERY,
  translations,
  classNames,
  ...props
}: InnerAutocompleteProps<TItem>) {
  const {
    indices,
    refine: refineAutocomplete,
    currentRefinement,
  } = useAutocomplete({
    transformItems,
  });

  const { isDetached, isModalDetached, isModalOpen, setIsModalOpen } =
    useDetachedMode(detachedMediaQuery);

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
    suggestionsIndexName: showSuggestions?.indexName,
  });

  const {
    getInputProps,
    getItemProps,
    getPanelProps,
    getRootProps,
    isOpen,
    setIsOpen,
    focusInput,
  } = usePropGetters<TItem>({
    indices: indicesForPropGetters,
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
    onSubmit: () => {
      // Close the detached modal when form is submitted
      if (isDetached) {
        setIsModalOpen(false);
      }
    },
    placeholder,
    isDetached,
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
    if (isDetached && isOpen) {
      setIsModalOpen(true);
    }
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

  indices.forEach(({ indexId, indexName, hits }) => {
    const elementId =
      indexName === showSuggestions?.indexName ? 'suggestions' : indexName;
    const filteredHits =
      elementId === 'suggestions' && showRecent
        ? hits.filter(
            (suggestionHit) =>
              !storageHits.find(
                (storageHit) => storageHit.query === suggestionHit.query
              )
          )
        : hits;
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
        items={filteredHits.map((item) => ({
          ...item,
          __indexName: indexId,
        }))}
        getItemProps={getItemProps}
        classNames={currentIndexConfig.classNames}
      />
    );
  });

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
      query={currentRefinement || indexUiState.query || ''}
      refine={refineSearchBox}
      isSearchStalled={isSearchStalled}
    />
  );

  const panelContent = (
    <AutocompletePanel {...getPanelProps()}>
      {PanelComponent ? (
        <PanelComponent elements={elements} indices={indices} />
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

  if (isDetached) {
    return (
      <Autocomplete {...props} {...getRootProps()} classNames={classNames}>
        <AutocompleteDetachedSearchButton
          query={currentRefinement || indexUiState.query || ''}
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
            onClose={() => {
              setIsModalOpen(false);
              setIsOpen(false);
            }}
          >
            <AutocompleteDetachedContainer
              classNames={detachedContainerClassNames}
            >
              <AutocompleteDetachedFormContainer
                classNames={classNames}
                onCancel={() => {
                  setIsModalOpen(false);
                  setIsOpen(false);
                }}
                translations={translations}
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
    <Autocomplete {...props} {...getRootProps()} classNames={classNames}>
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
