/** @jsx h */

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
  createAutocompleteRecentSearchComponent,
  createAutocompleteSearchComponent,
  createAutocompleteStorage,
  createAutocompleteSuggestionComponent,
  cx,
  getPromptSuggestionHits,
  isPromptSuggestion,
} from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';
import { useEffect, useId, useMemo, useRef, useState } from 'preact/hooks';

import TemplateComponent from '../../components/Template/Template';
import {
  connectAutocomplete,
  connectSearchBox,
  connectTrendingItems,
  connectFrequentlyBoughtTogether,
  connectRelatedProducts,
  connectLookingSimilar,
} from '../../connectors/index';
import { Highlight, ReverseHighlight } from '../../helpers/components';
import { component } from '../../lib/suit';
import { prepareTemplateProps } from '../../lib/templating';
import {
  createDocumentationMessageGenerator,
  find,
  getContainerNode,
  warn,
  walkIndex,
  type createSendEventForHits,
} from '../../lib/utils';
import configure from '../configure/configure';
import index from '../index/index';

import type {
  AutocompleteConnectorParams,
  AutocompleteRenderState,
  AutocompleteSource,
  AutocompleteWidgetDescription,
} from '../../connectors/autocomplete/connectAutocomplete';
import type { ChatRenderState } from '../../connectors/chat/connectChat';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  BaseHit,
  Hit,
  IndexUiState,
  IndexWidget,
  Renderer,
  RendererOptions,
  Template,
  WidgetFactory,
} from '../../types';
import type { PlainSearchParameters } from 'algoliasearch-helper';
import type {
  AutocompleteClassNames,
  AutocompleteIndexClassNames,
  AutocompleteIndexConfig,
  AutocompleteIndexProps,
} from 'instantsearch-ui-components';

let autocompleteInstanceId = 0;
const withUsage = createDocumentationMessageGenerator({ name: 'autocomplete' });
const suit = component('Autocomplete');

const Autocomplete = createAutocompleteComponent({
  createElement: h,
  Fragment,
});

const AutocompletePanel = createAutocompletePanelComponent({
  createElement: h,
  Fragment,
});

const AutocompleteIndex = createAutocompleteIndexComponent({
  createElement: h,
  Fragment,
});

const AutocompleteSuggestion = createAutocompleteSuggestionComponent({
  createElement: h,
  Fragment,
});

const AutocompletePromptSuggestion =
  createAutocompletePromptSuggestionComponent({
    createElement: h,
    Fragment,
  });

const AutocompleteSearchBox = createAutocompleteSearchComponent({
  createElement: h,
  Fragment,
});

const AutocompleteRecentSearch = createAutocompleteRecentSearchComponent({
  createElement: h,
  Fragment,
});

const AutocompleteDetachedContainer =
  createAutocompleteDetachedContainerComponent({
    createElement: h,
    Fragment,
  });

const AutocompleteDetachedOverlay = createAutocompleteDetachedOverlayComponent({
  createElement: h,
  Fragment,
});

const AutocompleteDetachedFormContainer =
  createAutocompleteDetachedFormContainerComponent({
    createElement: h,
    Fragment,
  });

const AutocompleteDetachedSearchButton =
  createAutocompleteDetachedSearchButtonComponent({
    createElement: h,
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
  useState,
  useMemo,
});

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

type RecommendHitsState = {
  hits: Hit[];
  sendEvent: ReturnType<typeof createSendEventForHits>;
};

type RendererParams<TItem extends BaseHit> = {
  instanceId: number;
  containerNode: HTMLElement;
  indicesConfig: Array<IndexConfig<TItem>>;
  sourcesConfig: Array<SourceConfig<TItem>>;
  renderState: {
    indexTemplateProps: Array<
      PreparedTemplateProps<NonNullable<IndexConfig<TItem>['templates']>>
    >;
    isolatedIndex: IndexWidget | undefined;
    targetIndex: IndexWidget | undefined;
    templateProps:
      | PreparedTemplateProps<NonNullable<AutocompleteTemplates>>
      | undefined;
    RecentSearchComponent: typeof AutocompleteRecentSearch;
    recentSearchHeaderComponent:
      | typeof AutocompleteIndex['prototype']['props']['HeaderComponent']
      | undefined;
    hasWarnedMissingPromptSuggestionsChat: boolean;
  };
  detachedMediaQuery: string | undefined;
  translations: AutocompleteTranslations;
} & Pick<
  AutocompleteWidgetParams<TItem>,
  | 'getSearchPageURL'
  | 'onSelect'
  | 'showQuerySuggestions'
  | 'showPromptSuggestions'
  | 'placeholder'
  | 'autofocus'
  | 'aiMode'
> & {
    showRecent:
      | Exclude<AutocompleteWidgetParams<TItem>['showRecent'], boolean>
      | undefined;
  } & Required<
    Pick<AutocompleteWidgetParams<TItem>, 'cssClasses' | 'templates'>
  >;

const createRenderer = <TItem extends BaseHit>(
  params: RendererParams<TItem>
): Renderer<
  AutocompleteRenderState,
  Partial<AutocompleteWidgetParams<TItem>>
> => {
  const { instanceId, containerNode, ...rendererParams } = params;
  return (connectorParams, isFirstRendering) => {
    if (isFirstRendering) {
      const showRecentObj = rendererParams.showRecent;
      let isolatedIndex = connectorParams.instantSearchInstance.mainIndex;
      let targetIndex = connectorParams.instantSearchInstance.mainIndex;
      walkIndex(targetIndex, (childIndex) => {
        if (childIndex.getIndexId() === `ais-autocomplete-${instanceId}`) {
          isolatedIndex = childIndex;
          targetIndex = childIndex.parent!;
        }
      });

      let RecentSearchComponent = ({
        item,
        onSelect,
        onApply,
        onRemoveRecentSearch,
      }: Parameters<typeof AutocompleteRecentSearch>[0]) => (
        <AutocompleteRecentSearch
          item={item}
          onSelect={onSelect}
          onApply={onApply}
          onRemoveRecentSearch={onRemoveRecentSearch}
        >
          {/* @ts-expect-error - it should accept string as return value */}
          <ConditionalReverseHighlight
            item={item as unknown as Hit<{ query: string }>}
          />
        </AutocompleteRecentSearch>
      );
      let recentSearchHeaderComponent: typeof AutocompleteIndex['prototype']['props']['HeaderComponent'] =
        undefined;

      if (showRecentObj && showRecentObj.templates) {
        const recentTemplateProps = prepareTemplateProps({
          defaultTemplates: {} as unknown as NonNullable<
            typeof showRecentObj.templates
          >,
          templatesConfig:
            connectorParams.instantSearchInstance.templatesConfig,
          templates: showRecentObj.templates,
        });

        if (showRecentObj.templates.item) {
          RecentSearchComponent = ({
            item,
            onSelect,
            onRemoveRecentSearch,
          }) => (
            <TemplateComponent
              {...recentTemplateProps}
              templateKey="item"
              rootTagName="fragment"
              data={{ item, onSelect, onRemoveRecentSearch }}
            />
          );
        }

        if (showRecentObj.templates.header) {
          recentSearchHeaderComponent = ({
            items,
          }: {
            items: Array<{ query: string }>;
          }) => (
            <TemplateComponent
              {...recentTemplateProps}
              templateKey="header"
              rootTagName="fragment"
              data={{ items }}
            />
          );
        }
      }
      rendererParams.renderState = {
        indexTemplateProps: [],
        isolatedIndex,
        targetIndex,
        templateProps: prepareTemplateProps({
          defaultTemplates: {} as unknown as NonNullable<
            typeof rendererParams.templates
          >,
          templatesConfig:
            connectorParams.instantSearchInstance.templatesConfig,
          templates: rendererParams.templates,
        }),
        RecentSearchComponent,
        recentSearchHeaderComponent,
        hasWarnedMissingPromptSuggestionsChat: false,
      };

      connectorParams.refine(targetIndex.getHelper()?.state.query ?? '');
      return;
    }

    render(
      <AutocompleteWrapper<TItem> {...rendererParams} {...connectorParams} />,
      containerNode
    );
  };
};

type AutocompleteWrapperProps<TItem extends BaseHit> = Pick<
  RendererParams<TItem>,
  | 'indicesConfig'
  | 'sourcesConfig'
  | 'getSearchPageURL'
  | 'onSelect'
  | 'cssClasses'
  | 'templates'
  | 'renderState'
  | 'showRecent'
  | 'showQuerySuggestions'
  | 'showPromptSuggestions'
  | 'placeholder'
  | 'autofocus'
  | 'detachedMediaQuery'
  | 'translations'
  | 'aiMode'
> &
  Pick<AutocompleteRenderState, 'sources' | 'indices' | 'refine'> &
  RendererOptions<Partial<AutocompleteWidgetParams<TItem>>>;

function AutocompleteWrapper<TItem extends BaseHit>({
  indicesConfig,
  sourcesConfig,
  sources,
  indices,
  getSearchPageURL,
  onSelect: userOnSelect,
  refine: refineAutocomplete,
  cssClasses,
  renderState,
  instantSearchInstance,
  showRecent,
  showQuerySuggestions,
  showPromptSuggestions,
  templates,
  placeholder,
  autofocus,
  detachedMediaQuery,
  translations,
  aiMode,
}: AutocompleteWrapperProps<TItem>) {
  const { isolatedIndex, targetIndex } = renderState;

  const searchboxQuery = isolatedIndex?.getHelper()?.state.query;
  const targetIndexQuery = targetIndex?.getHelper()?.state.query;

  const [localQuery, setLocalQuery] = useState(
    searchboxQuery !== undefined ? searchboxQuery : targetIndexQuery ?? ''
  );

  useEffect(() => {
    // When the isolated index has a defined query (including ''), use it.
    // Only fall back to the target index query when not yet set (undefined).
    const query =
      searchboxQuery !== undefined ? searchboxQuery : targetIndexQuery;
    if (query !== undefined) {
      setLocalQuery(query);
    }
  }, [searchboxQuery, targetIndexQuery]);

  const resolvedDetachedMediaQuery = useMemo(
    () =>
      resolveMediaQuery(
        detachedMediaQuery,
        DETACHED_MEDIA_QUERY_CSS_VAR,
        DEFAULT_DETACHED_MEDIA_QUERY
      ),
    [detachedMediaQuery]
  );
  const [isDetached, setIsDetached] = useState(
    resolvedDetachedMediaQuery
      ? Boolean(getMediaQueryList(resolvedDetachedMediaQuery)?.matches)
      : false
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDetached, setIsModalDetached] = useState(false);
  const previousIsDetachedRef = useRef(isDetached);

  // Media query listener for detached mode
  useEffect(() => {
    if (!resolvedDetachedMediaQuery) {
      setIsDetached(false);
      return () => {};
    }

    const mql = getMediaQueryList(resolvedDetachedMediaQuery);
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
  }, [resolvedDetachedMediaQuery, isDetached]);

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

  // Body class management for scroll prevention
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

  const {
    storage,
    storageHits,
    indicesConfigForPropGetters,
    indicesForPropGetters,
  } = useStorage<TItem>({
    query: searchboxQuery,
    showRecent,
    indices,
    indicesConfig,
    suggestionsIndexName: showQuerySuggestions?.indexName,
  });
  const promptSuggestionsIndexName = showPromptSuggestions?.indexName;
  const promptSuggestionsLimit =
    showPromptSuggestions?.searchParameters?.hitsPerPage ?? 3;
  const indicesForPanelRaw = indices.map((autocompleteIndex) => {
    const dedupedHits =
      autocompleteIndex.indexName === showQuerySuggestions?.indexName &&
      showRecent
        ? autocompleteIndex.hits.filter(
            (suggestionHit) =>
              !find(
                storageHits,
                (storageHit) => storageHit.query === suggestionHit.query
              )
          )
        : autocompleteIndex.hits;

    if (autocompleteIndex.indexName !== promptSuggestionsIndexName) {
      return {
        ...autocompleteIndex,
        hits: dedupedHits,
      };
    }

    return {
      ...autocompleteIndex,
      hits: getPromptSuggestionHits({
        hits: dedupedHits as Array<
          { objectID: string } & Record<string, unknown>
        >,
        limit: promptSuggestionsLimit,
      }),
    };
  });
  const indicesForPropGettersWithPromptSuggestions = indicesForPropGetters.map(
    (autocompleteIndex) => {
      if (autocompleteIndex.indexName !== promptSuggestionsIndexName) {
        return autocompleteIndex;
      }

      return {
        ...autocompleteIndex,
        hits: getPromptSuggestionHits({
          hits: autocompleteIndex.hits as Array<
            { objectID: string } & Record<string, unknown>
          >,
          limit: promptSuggestionsLimit,
        }),
      };
    }
  );
  const showRecentObj = showRecent;

  const recentSearchCssClasses = {
    root: cx('ais-AutocompleteRecentSearches', showRecentObj?.cssClasses?.root),
    list: cx(
      'ais-AutocompleteRecentSearchesList',
      showRecentObj?.cssClasses?.list
    ),
    header: cx(
      'ais-AutocompleteRecentSearchesHeader',
      showRecentObj?.cssClasses?.header
    ),
    item: cx(
      'ais-AutocompleteRecentSearchesItem',
      showRecentObj?.cssClasses?.item
    ),
  };

  const isSearchPage =
    targetIndex
      ?.getWidgets()
      .some(({ $$type }) =>
        ['ais.hits', 'ais.infiniteHits'].includes($$type)
      ) ?? false;

  const onRefine = (query: string) => {
    setLocalQuery(query);
    refineAutocomplete(query);
    instantSearchInstance.setUiState((uiState) => ({
      ...uiState,
      [targetIndex!.getIndexId()]: {
        ...uiState[targetIndex!.getIndexId()],
        query,
      },
      [isolatedIndex!.getIndexId()]: { query },
    }));
    query.length > 0 && storage.onAdd(query);
  };

  // Apply showWhen filtering for index sources. Index sources default to 'always'.
  const indicesForPanel = indicesForPanelRaw.filter((autocompleteIndex) => {
    const config = find(
      sourcesConfig,
      (c): c is IndexSourceConfig<TItem> =>
        c.sourceType !== 'recommend' &&
        c.indexName === autocompleteIndex.indexName
    );
    const showWhen = config?.showWhen ?? 'always';
    if (showWhen === 'empty') return !localQuery;
    if (showWhen === 'querying') return Boolean(localQuery);
    return true;
  });

  // Resolve recommend sources for this render from the connector's sources array,
  // filtered by each source's showWhen setting.
  // Recommend sources default to 'empty' (show only when no query).
  const recommendForPanel = sources
    .filter((source) => source.sourceType === 'recommend')
    .map((source) => {
      const config = find(
        sourcesConfig,
        (c) =>
          c.sourceType === 'recommend' &&
          (c.sourceId || c.model) === source.indexId
      ) as RecommendSourceConfig<TItem> | undefined;
      return config ? { sourceId: source.indexId, config, hits: source.hits, sendEvent: source.sendEvent } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .filter(({ config }) => {
      const showWhen = config.showWhen ?? 'empty';
      if (showWhen === 'empty') return !localQuery;
      if (showWhen === 'querying') return Boolean(localQuery);
      return true;
    });

  const allIndicesEmpty = indicesForPanel.every(
    ({ hits }) => hits.length === 0
  );
  const allRecommendEmpty = recommendForPanel.every(
    ({ hits }) => hits.length === 0
  );
  const recentEmpty = !storageHits || storageHits.length === 0;
  const hasNoResultsTemplate = indicesConfig.some(
    (c) => c.templates?.noResults !== undefined
  );
  const shouldHideEmptyPanel =
    allIndicesEmpty && allRecommendEmpty && recentEmpty && !hasNoResultsTemplate && !templates.panel;

  const {
    getInputProps,
    getItemProps,
    getPanelProps,
    getRootProps,
    isOpen,
    setIsOpen,
    focusInput,
  } = usePropGetters({
    indices: indicesForPropGettersWithPromptSuggestions,
    indicesConfig: indicesConfigForPropGetters,
    onRefine,
    onSelect:
      userOnSelect ??
      (({ query, item, setQuery, url }) => {
        if (isPromptSuggestion(item)) {
          const chatRenderState = instantSearchInstance.renderState[
            targetIndex!.getIndexId()
          ]?.chat as Partial<ChatRenderState> | undefined;

          if (chatRenderState) {
            chatRenderState.setOpen?.(true);
            chatRenderState.focusInput?.();
            chatRenderState.sendMessage?.({ text: item.prompt });
            return;
          }

          if (
            __DEV__ &&
            showPromptSuggestions?.indexName &&
            !renderState.hasWarnedMissingPromptSuggestionsChat
          ) {
            renderState.hasWarnedMissingPromptSuggestionsChat = true;
            warn(
              'showPromptSuggestions requires a Chat widget in the same index to open chat and send messages. Add `chat()` to enable this behavior.'
            );
          }
        }

        if (url) {
          window.location.href = url;
          return;
        }

        if (!isSearchPage && typeof getSearchPageURL !== 'undefined') {
          const indexUiState =
            instantSearchInstance.getUiState()[targetIndex!.getIndexId()];
          window.location.href = getSearchPageURL({ ...indexUiState, query });
          return;
        }

        setQuery(query);
      }),
    onApply: (query: string) => {
      refineAutocomplete(query);
    },
    onSubmit: () => {
      // Close the detached modal when form is submitted
      if (isDetached) {
        setIsModalOpen(false);
      }
    },
    placeholder,
    isDetached,
    shouldHidePanel: shouldHideEmptyPanel,
    autoFocus: autofocus,
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
  if (showRecent) {
    elements.recent = (
      <AutocompleteIndex
        HeaderComponent={renderState.recentSearchHeaderComponent}
        // @ts-ignore - there seems to be problems with React.ComponentType and this, but it's actually correct
        ItemComponent={({ item, onSelect, onApply }) => (
          <renderState.RecentSearchComponent
            item={item as unknown as { query: string }}
            onSelect={onSelect}
            onApply={onApply}
            onRemoveRecentSearch={() =>
              storage.onRemove((item as unknown as { query: string }).query)
            }
          />
        )}
        classNames={recentSearchCssClasses}
        items={storageHits}
        getItemProps={getItemProps}
      />
    );
  }

  indicesForPanel.forEach(({ indexId, indexName, hits }, i) => {
    const currentIndexConfig = find(
      indicesConfig,
      (config) => config.indexName === indexName
    );

    if (!currentIndexConfig) {
      return;
    }

    if (!renderState.indexTemplateProps[i]) {
      renderState.indexTemplateProps[i] = prepareTemplateProps({
        defaultTemplates: {} as unknown as NonNullable<
          IndexConfig<TItem>['templates']
        >,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: currentIndexConfig.templates,
      });
    }

    const headerComponent = currentIndexConfig.templates?.header
      ? ({
          items,
        }: Parameters<
          NonNullable<AutocompleteIndexProps['HeaderComponent']>
        >[0]) => {
          return (
            <TemplateComponent
              {...renderState.indexTemplateProps[i]}
              templateKey="header"
              rootTagName="fragment"
              data={{ items }}
            />
          );
        }
      : undefined;
    const itemComponent = ({
      item,
      onSelect,
      onApply,
    }: Parameters<AutocompleteIndexProps['ItemComponent']>[0]) => {
      return (
        <TemplateComponent
          {...renderState.indexTemplateProps[i]}
          templateKey="item"
          rootTagName="fragment"
          data={{ item, onSelect, onApply }}
        />
      );
    };

    const noResultsComponent = currentIndexConfig.templates?.noResults
      ? () => (
          <TemplateComponent
            {...renderState.indexTemplateProps[i]}
            templateKey="noResults"
            rootTagName="fragment"
            data={{}}
          />
        )
      : undefined;

    let elementId = indexName;
    if (indexName === showQuerySuggestions?.indexName) {
      elementId = 'suggestions';
    } else if (indexName === showPromptSuggestions?.indexName) {
      elementId = 'promptSuggestions';
    }

    elements[elementId] = (
      <AutocompleteIndex
        key={indexId}
        HeaderComponent={headerComponent}
        ItemComponent={itemComponent}
        NoResultsComponent={noResultsComponent}
        items={hits.map((item) => ({
          ...item,
          __indexName: indexId,
        }))}
        getItemProps={getItemProps}
        sendEvent={find(indices, (idx) => idx.indexId === indexId)?.sendEvent}
        classNames={currentIndexConfig.cssClasses}
      />
    );
  });

  // Render recommend sources into the elements map.
  recommendForPanel.forEach(({ sourceId, config, hits, sendEvent }) => {
    const recommendIndexInConfig = sourcesConfig
      .filter((c): c is RecommendSourceConfig<TItem> => c.sourceType === 'recommend')
      .indexOf(config);
    const recommendTemplateProps = renderState.indexTemplateProps[
      indicesForPanel.length + recommendIndexInConfig
    ] ?? prepareTemplateProps({
      defaultTemplates: {} as any,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates: config.templates,
    });

    if (!renderState.indexTemplateProps[indicesForPanel.length + recommendIndexInConfig]) {
      renderState.indexTemplateProps[indicesForPanel.length + recommendIndexInConfig] = recommendTemplateProps;
    }

    const headerComponent = config.templates?.header
      ? ({
          items,
        }: Parameters<NonNullable<AutocompleteIndexProps['HeaderComponent']>>[0]) => (
          <TemplateComponent
            {...recommendTemplateProps}
            templateKey="header"
            rootTagName="fragment"
            data={{ items }}
          />
        )
      : undefined;

    const itemComponent = ({
      item,
      onSelect,
      onApply,
    }: Parameters<AutocompleteIndexProps['ItemComponent']>[0]) => (
      <TemplateComponent
        {...recommendTemplateProps}
        templateKey="item"
        rootTagName="fragment"
        data={{ item, onSelect, onApply }}
      />
    );

    elements[sourceId] = (
      <AutocompleteIndex
        key={sourceId}
        HeaderComponent={headerComponent}
        ItemComponent={itemComponent}
        items={hits.map((item) => ({
          ...item,
          __indexName: sourceId,
        }))}
        getItemProps={getItemProps}
        sendEvent={sendEvent}
        classNames={config.cssClasses}
      />
    );
  });

  // Re-order elements to respect sources order (which respects transformItems reordering).
  // recent always leads; other positions follow the transformed sources order.
  const panelElements: PanelElements = {};
  if (elements.recent) panelElements.recent = elements.recent;
  sources.forEach((source) => {
    if (source.sourceType !== 'index') {
      if (elements[source.indexId]) panelElements[source.indexId] = elements[source.indexId];
      return;
    }
    // Map index sources to their element key (special sources use canonical names).
    let elementKey: string = source.indexName;
    if (source.indexName === showQuerySuggestions?.indexName) {
      elementKey = 'suggestions';
    } else if (source.indexName === showPromptSuggestions?.indexName) {
      elementKey = 'promptSuggestions';
    }
    if (elements[elementKey]) panelElements[elementKey] = elements[elementKey];
  });

  const rawInputProps = getInputProps();
  const inputProps =
    typeof rawInputProps === 'object' && rawInputProps !== null
      ? rawInputProps
      : {};

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsOpen(false);
  };

  const searchBoxContent = (
    <AutocompleteSearchBox
      query={localQuery}
      inputProps={{
        ...inputProps,
        onInput: (event: { currentTarget: EventTarget & HTMLInputElement }) => {
          const query = event.currentTarget.value;
          setLocalQuery(query);
          refineAutocomplete(query);
        },
      }}
      onClear={() => {
        onRefine('');
      }}
      isSearchStalled={instantSearchInstance.status === 'stalled'}
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
              const indexId = targetIndex!.getIndexId();
              const chatState = instantSearchInstance.renderState[indexId]
                ?.chat as Partial<ChatRenderState> | undefined;

              if (chatState) {
                chatState.setOpen?.(true);
                if (localQuery.trim()) {
                  chatState.sendMessage?.({ text: localQuery });
                }
              }
            }
          : undefined
      }
    />
  );

  const panelContent = (
    <AutocompletePanel {...getPanelProps()}>
      {templates.panel ? (
        <TemplateComponent
          {...renderState.templateProps}
          templateKey="panel"
          rootTagName="fragment"
          data={{ elements: panelElements, indices: indicesForPanel, sources }}
        />
      ) : (
        Object.keys(panelElements).map((elementId) => panelElements[elementId])
      )}
    </AutocompletePanel>
  );
  const detachedContainerCssClasses = isModalDetached
    ? {
        ...cssClasses,
        detachedContainer: cx(
          'ais-AutocompleteDetachedContainer--modal',
          cssClasses.detachedContainer
        ),
      }
    : cssClasses;
  const { ref: rootRef, ...rootProps } = getRootProps();

  if (isDetached) {
    return (
      <Autocomplete {...rootProps} rootRef={rootRef} classNames={cssClasses}>
        <AutocompleteDetachedSearchButton
          query={localQuery}
          placeholder={placeholder}
          classNames={cssClasses}
          onClick={() => {
            setIsModalOpen(true);
            setIsOpen(true);
          }}
          onClear={() => {
            onRefine('');
          }}
          translations={translations}
        />
        {isModalOpen && (
          <AutocompleteDetachedOverlay
            classNames={cssClasses}
            onClose={handleCancel}
          >
            <AutocompleteDetachedContainer
              classNames={detachedContainerCssClasses}
            >
              <AutocompleteDetachedFormContainer
                classNames={cssClasses}
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
    <Autocomplete {...rootProps} rootRef={rootRef} classNames={cssClasses}>
      {searchBoxContent}
      {panelContent}
    </Autocomplete>
  );
}

export type AutocompleteCSSClasses = Partial<AutocompleteClassNames>;

export type AutocompleteSearchParameters = Omit<PlainSearchParameters, 'index'>;

/** Controls when a source is visible relative to the current query. */
export type ShowWhen = 'always' | 'empty' | 'querying';

export type AutocompleteTemplates = {
  /**
   * Template to use for the panel. Receives `elements` (keyed by index name or
   * recommend sourceId), the legacy `indices` array, and the unified `sources`
   * array from the connector.
   */
  panel?: Template<{
    elements: PanelElements;
    /** @deprecated Use `sources` instead. */
    indices: AutocompleteRenderState['indices'];
    sources: AutocompleteRenderState['sources'];
  }>;
};

type IndexConfig<TItem extends BaseHit> = AutocompleteIndexConfig<TItem> & {
  templates?: Partial<{
    /**
     * Template to use for the header, before the list of items.
     */
    header: Template<{ items: TItem[] }>;
    /**
     * Template to use for each result. This template will receive an object containing a single record.
     */
    item: Template<{ item: TItem; onSelect: () => void }>;
    /**
     * Template to use when no results are found.
     */
    noResults: Template<Record<string, never>>;
  }>;

  /**
   * Search parameters to apply to this index.
   */
  searchParameters?: AutocompleteSearchParameters;

  cssClasses?: Partial<AutocompleteIndexClassNames>;
};

/** A search-index-backed source. Extends `IndexConfig` with `showWhen`. */
export type IndexSourceConfig<TItem extends BaseHit> = IndexConfig<TItem> & {
  sourceType?: 'index';
  /**
   * When to display this source.
   * @default 'always'
   */
  showWhen?: ShowWhen;
};

/** A Recommend-backed source. */
export type RecommendSourceConfig<TItem extends BaseHit> = {
  sourceType: 'recommend';
  /**
   * The Recommend model to use.
   */
  model: 'trendingItems' | 'frequentlyBoughtTogether' | 'relatedProducts' | 'lookingSimilar';
  /**
   * The index to fetch recommendations from. Defaults to the parent index.
   */
  indexName?: string;
  /**
   * The objectID of the item to use as the basis for recommendations.
   * Required for frequentlyBoughtTogether, relatedProducts, and lookingSimilar.
   */
  objectID?: string;
  /**
   * Maximum number of recommendations to return.
   */
  limit?: number;
  /**
   * Minimum recommendation score threshold (0–100).
   */
  threshold?: number;
  /**
   * Search parameters to apply as filters to the recommendations.
   */
  queryParameters?: AutocompleteSearchParameters;
  /**
   * When to display this source.
   * @default 'empty'
   */
  showWhen?: ShowWhen;
  /**
   * Identifier for this source in the `elements` map and `sources` array.
   * Defaults to `model`.
   */
  sourceId?: string;
  templates?: Partial<{
    header: Template<{ items: TItem[] }>;
    item: Template<{ item: TItem; onSelect: () => void }>;
  }>;
  cssClasses?: Partial<AutocompleteIndexClassNames>;
};

/** A source in the autocomplete panel — either a search index or a Recommend model. */
export type SourceConfig<TItem extends BaseHit> =
  | IndexSourceConfig<TItem>
  | RecommendSourceConfig<TItem>;

type PanelElements = Partial<
  // eslint-disable-next-line @typescript-eslint/ban-types
  Record<'recent' | 'suggestions' | (string & {}), preact.JSX.Element>
>;

type AutocompleteWidgetParams<TItem extends BaseHit> = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Sources to show in the Autocomplete panel. Each source can be a search
   * index or a Recommend-powered source. The order here controls the display
   * order in the panel.
   *
   * Use `showWhen` on each source to control visibility:
   * - `'always'` — always shown (default for index sources)
   * - `'empty'` — shown only when the query is empty (default for recommend sources)
   * - `'querying'` — shown only when the user is typing
   */
  sources?: Array<SourceConfig<TItem>>;

  /**
   * @deprecated Use `sources` with `{ sourceType: 'index', indexName: '...' }` instead.
   */
  indices?: Array<IndexConfig<TItem>>;

  /**
   * Index to use for retrieving and showing query suggestions.
   */
  showQuerySuggestions?: Partial<
    Pick<
      IndexConfig<{ query: string }>,
      'indexName' | 'getURL' | 'templates' | 'cssClasses' | 'searchParameters'
    >
  >;
  showPromptSuggestions?: Partial<
    Pick<
      IndexConfig<{ query: string; label?: string }>,
      'indexName' | 'getURL' | 'templates' | 'cssClasses' | 'searchParameters'
    >
  >;

  showRecent?:
    | boolean
    | {
        /**
         * Storage key to use in the local storage.
         */
        storageKey?: string;
        templates?: Partial<{
          /**
           * Template to use for the header, before the list of items.
           */
          header: Template<{ items: Array<{ query: string }> }>;
          /**
           * Template to use for each result. This template will receive an object containing a single record.
           */
          item: Template<{
            item: { query: string };
            onSelect: () => void;
            onRemoveRecentSearch: () => void;
          }>;
        }>;
        cssClasses?: Partial<AutocompleteIndexClassNames>;
      };

  /**
   * Transforms all sources before rendering. Receives the unified sources
   * array (both index and recommend sources).
   */
  transformItems?: (sources: AutocompleteSource[]) => AutocompleteSource[];

  /**
   * Search parameters to apply to the autocomplete indices.
   */
  searchParameters?: AutocompleteSearchParameters;

  getSearchPageURL?: (nextUiState: IndexUiState) => string;

  onSelect?: AutocompleteIndexConfig<TItem>['onSelect'];

  /**
   * Templates to use for the widget.
   */
  templates?: AutocompleteTemplates;

  /**
   * CSS classes to add.
   */
  cssClasses?: AutocompleteCSSClasses;

  /**
   * Placeholder text for the search input.
   */
  placeholder?: string;

  /**
   * Whether the input should be focused and the panel open initially.
   */
  autofocus?: boolean;

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

export type AutocompleteWidget<TItem extends BaseHit = BaseHit> = WidgetFactory<
  AutocompleteWidgetDescription & { $$widgetType: 'ais.autocomplete' },
  AutocompleteConnectorParams,
  AutocompleteWidgetParams<TItem>
>;

export function EXPERIMENTAL_autocomplete<TItem extends BaseHit = BaseHit>(
  widgetParams: AutocompleteWidgetParams<TItem> & AutocompleteConnectorParams
) {
  const {
    container,
    escapeHTML,
    sources: userSources = [],
    indices: legacyIndices = [],
    showQuerySuggestions,
    showPromptSuggestions,
    showRecent,
    searchParameters: userSearchParameters,
    getSearchPageURL,
    onSelect,
    templates = {},
    transformItems,
    cssClasses: userCssClasses = {},
    placeholder,
    autofocus,
    detachedMediaQuery,
    translations: userTranslations = {},
    aiMode,
  } = widgetParams || {};

  // Normalize: legacy `indices` become IndexSourceConfig entries appended after
  // any explicitly declared sources.
  const allSources: SourceConfig<TItem>[] = [
    ...userSources,
    ...legacyIndices.map((idx) => ({ ...idx, sourceType: 'index' as const })),
  ];

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const searchParameters = {
    hitsPerPage: 5,
    ...userSearchParameters,
  };

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
  } satisfies AutocompleteCSSClasses;

  // Split allSources into index-backed and recommend-backed.
  const indexSources = allSources.filter(
    (s): s is IndexSourceConfig<TItem> => s.sourceType !== 'recommend'
  );
  const recommendSources = allSources.filter(
    (s): s is RecommendSourceConfig<TItem> => s.sourceType === 'recommend'
  );

  // Shared map for recommend results — written by recommend widgets, read by the renderer.
  const recommendResults = new Map<string, RecommendHitsState>();

  const indicesConfig = [...indexSources];
  if (showQuerySuggestions?.indexName) {
    indicesConfig.unshift({
      indexName: showQuerySuggestions.indexName,
      templates: {
        // @ts-expect-error
        item: ({
          item,
          onSelect: onSelectItem,
          onApply,
        }: {
          item: { query: string };
          onSelect: () => void;
          onApply: () => void;
        }) => (
          <AutocompleteSuggestion
            item={item}
            onSelect={onSelectItem}
            onApply={onApply}
          >
            {/* @ts-expect-error - it should accept string as return value */}
            <ConditionalReverseHighlight
              item={item as unknown as Hit<{ query: string }>}
            />
          </AutocompleteSuggestion>
        ),
        ...showQuerySuggestions.templates,
      },
      cssClasses: {
        root: cx(
          'ais-AutocompleteSuggestions',
          showQuerySuggestions.cssClasses?.root
        ),
        list: cx(
          'ais-AutocompleteSuggestionsList',
          showQuerySuggestions.cssClasses?.list
        ),
        header: cx(
          'ais-AutocompleteSuggestionsHeader',
          showQuerySuggestions.cssClasses?.header
        ),
        item: cx(
          'ais-AutocompleteSuggestionsItem',
          showQuerySuggestions.cssClasses?.item
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
      templates: {
        // @ts-expect-error
        item: ({
          item,
          onSelect: onSelectItem,
        }: {
          item: {
            prompt: string;
            label?: string;
          };
          onSelect: () => void;
        }) => (
          <AutocompletePromptSuggestion item={item} onSelect={onSelectItem}>
            {renderConditionalHighlight({
              item: item as unknown as Hit<{ prompt: string }>,
              attribute: 'prompt',
            })}
          </AutocompletePromptSuggestion>
        ),
        ...showPromptSuggestions.templates,
      },
      cssClasses: {
        root: cx(
          'ais-AutocompletePromptSuggestions',
          showPromptSuggestions.cssClasses?.root
        ),
        list: cx(
          'ais-AutocompletePromptSuggestionsList',
          showPromptSuggestions.cssClasses?.list
        ),
        header: cx(
          'ais-AutocompletePromptSuggestionsHeader',
          showPromptSuggestions.cssClasses?.header
        ),
        item: cx(
          'ais-AutocompletePromptSuggestionsItem',
          showPromptSuggestions.cssClasses?.item
        ),
      },
      searchParameters: {
        hitsPerPage: 3,
        ...showPromptSuggestions.searchParameters,
      },
      getQuery: (item) => item.prompt,
      getURL:
        showPromptSuggestions.getURL as unknown as IndexConfig<TItem>['getURL'],
    });
  }

  const instanceId = ++autocompleteInstanceId;
  const shouldShowRecent = showRecent || undefined;
  const showRecentOptions =
    typeof shouldShowRecent === 'boolean' ? {} : shouldShowRecent;

  const translations: AutocompleteTranslations = {
    ...DEFAULT_TRANSLATIONS,
    ...userTranslations,
  };

  const sharedRenderState: RendererParams<TItem>['renderState'] = {
    indexTemplateProps: [],
    isolatedIndex: undefined,
    targetIndex: undefined,
    templateProps: undefined,
    RecentSearchComponent: AutocompleteRecentSearch,
    recentSearchHeaderComponent: undefined,
    hasWarnedMissingPromptSuggestionsChat: false,
  };

  const specializedRenderer = createRenderer({
    instanceId,
    containerNode,
    indicesConfig,
    sourcesConfig: allSources,
    getSearchPageURL,
    onSelect,
    cssClasses,
    showRecent: showRecentOptions,
    showQuerySuggestions,
    showPromptSuggestions,
    placeholder,
    autofocus,
    detachedMediaQuery,
    translations,
    renderState: sharedRenderState,
    templates,
    aiMode,
  });

  const makeWidget = connectAutocomplete(specializedRenderer, () =>
    render(null, containerNode)
  );

  // Build recommend widgets — each writes its results into `recommendResults`.
  // No re-render is triggered here; the search render picks up the latest Map
  // state so both result types are always shown together in a single render.
  const recommendWidgets = recommendSources.map((config) => {
    const sourceId = config.sourceId || config.model;

    const storeResults = (renderState: { items: any[]; sendEvent: any }) => {
      recommendResults.set(sourceId, {
        hits: renderState.items as Hit[],
        sendEvent: renderState.sendEvent,
      });
    };

    // Map model to the appropriate connector.
    let widget = null;
    if (config.model === 'trendingItems') {
      widget = connectTrendingItems(storeResults)({
        limit: config.limit,
        threshold: config.threshold,
        queryParameters: config.queryParameters,
      });
    } else if (config.model === 'frequentlyBoughtTogether') {
      widget = connectFrequentlyBoughtTogether(storeResults)({
        objectIDs: config.objectID ? [config.objectID] : [],
        limit: config.limit,
        threshold: config.threshold,
        queryParameters: config.queryParameters,
      });
    } else if (config.model === 'relatedProducts') {
      widget = connectRelatedProducts(storeResults)({
        objectIDs: config.objectID ? [config.objectID] : [],
        limit: config.limit,
        threshold: config.threshold,
        queryParameters: config.queryParameters,
      });
    } else if (config.model === 'lookingSimilar') {
      widget = connectLookingSimilar(storeResults)({
        objectIDs: config.objectID ? [config.objectID] : [],
        limit: config.limit,
        threshold: config.threshold,
        queryParameters: config.queryParameters,
      });
    }

    if (!widget) return null;

    // Wrap in an index widget when the user specifies a different indexName,
    // so recommendations are fetched from that index rather than the parent.
    if (config.indexName) {
      return index({ indexName: config.indexName }).addWidgets([widget]);
    }

    return widget;
  }).filter((w): w is NonNullable<typeof w> => w !== null);

  return [
    connectSearchBox(() => null)({}),
    index({
      indexId: `ais-autocomplete-${instanceId}`,
      EXPERIMENTAL_isolated: true,
    }).addWidgets([
      configure(searchParameters),
      ...indicesConfig.map(
        ({ indexName, searchParameters: indexSearchParameters }) =>
          index({ indexName, indexId: indexName }).addWidgets([
            configure(indexSearchParameters || {}),
          ])
      ),
      ...recommendWidgets,
      {
        ...makeWidget({
          escapeHTML,
          transformItems,
          future: { undefinedEmptyQuery: true },
          // Private params consumed by the connector — not part of the public API.
          _recommendSources: recommendResults,
          _sourcesOrder: [
            // indicesConfig already has showQuerySuggestions/showPromptSuggestions
            // in their correct positions (unshift/push respectively).
            ...indicesConfig.map(({ indexName }) => ({
              sourceId: indexName,
              sourceType: 'index' as const,
            })),
            ...recommendSources.map((s) => ({
              sourceId: s.sourceId || s.model,
              sourceType: 'recommend' as const,
            })),
          ],
        } as any),
        $$widgetType: 'ais.autocomplete',
      },
    ]),
  ];
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

function renderConditionalHighlight<
  TItem extends BaseHit,
  TAttribute extends keyof TItem & string = keyof TItem & string
>({ item, attribute }: { item: Hit<TItem>; attribute: TAttribute }) {
  if (
    !item._highlightResult?.[attribute] ||
    // @ts-expect-error - we should not have matchLevel as arrays here
    item._highlightResult[attribute].matchLevel === 'none'
  ) {
    return item[attribute];
  }

  return <Highlight attribute={attribute} hit={item} />;
}
