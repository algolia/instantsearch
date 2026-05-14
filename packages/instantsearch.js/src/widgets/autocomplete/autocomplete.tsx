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
import connectFeeds from '../../connectors/feeds/connectFeeds';
import { createFeedContainer } from '../../connectors/feeds/FeedContainer';
import { connectAutocomplete, connectSearchBox } from '../../connectors/index';
import { Highlight, ReverseHighlight } from '../../helpers/components';
import { isChatBusy, openChat } from '../../lib/chat';
import { component } from '../../lib/suit';
import { prepareTemplateProps } from '../../lib/templating';
import {
  createDocumentationMessageGenerator,
  find,
  getContainerNode,
  noop,
  warn,
  walkIndex,
} from '../../lib/utils';
import configure from '../configure/configure';
import index from '../index/index';

import type {
  AutocompleteConnectorParams,
  AutocompleteRenderState,
  AutocompleteWidgetDescription,
  TransformItemsIndicesConfig,
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
  Widget,
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

type RendererParams<TItem extends BaseHit> = {
  instanceId: number;
  containerNode: HTMLElement;
  indicesConfig: Array<IndexConfig<TItem>>;
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
  IndicesAutocompleteWidgetParams<TItem>,
  | 'getSearchPageURL'
  | 'onSelect'
  | 'showQuerySuggestions'
  | 'showPromptSuggestions'
  | 'placeholder'
  | 'autofocus'
  | 'aiMode'
> & {
    showRecent:
      | Exclude<IndicesAutocompleteWidgetParams<TItem>['showRecent'], boolean>
      | undefined;
  } & Required<
    Pick<IndicesAutocompleteWidgetParams<TItem>, 'cssClasses' | 'templates'>
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
  Pick<AutocompleteRenderState, 'indices' | 'refine'> &
  RendererOptions<Partial<AutocompleteWidgetParams<TItem>>>;

function AutocompleteWrapper<TItem extends BaseHit>({
  indicesConfig,
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
  const indicesForPanel = indices.map((autocompleteIndex) => {
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

  const allIndicesEmpty = indicesForPanel.every(
    ({ hits }) => hits.length === 0
  );
  const recentEmpty = !storageHits || storageHits.length === 0;
  const hasNoResultsTemplate = indicesConfig.some(
    (c) => c.templates?.noResults !== undefined
  );
  const shouldHideEmptyPanel =
    allIndicesEmpty && recentEmpty && !hasNoResultsTemplate && !templates.panel;

  const getChatRenderState = () =>
    instantSearchInstance.renderState[targetIndex!.getIndexId()]?.chat as
      | Partial<ChatRenderState>
      | undefined;

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
          const chatRenderState = getChatRenderState();

          if (chatRenderState) {
            if (openChat(chatRenderState, { message: item.prompt })) {
              setQuery('');
            }
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
        onInput: (event: { currentTarget: HTMLInputElement }) => {
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
              if (openChat(getChatRenderState(), { message: localQuery })) {
                onRefine('');
              }
            }
          : undefined
      }
      aiModeButtonDisabled={
        aiMode ? isChatBusy(getChatRenderState()) : undefined
      }
      classNames={cssClasses}
    />
  );

  const panelContent = (
    <AutocompletePanel
      {...getPanelProps()}
      classNames={{
        root: cssClasses?.panel,
        open: cssClasses?.panelOpen,
        layout: cssClasses?.panelLayout,
      }}
    >
      {templates.panel ? (
        <TemplateComponent
          {...renderState.templateProps}
          templateKey="panel"
          rootTagName="fragment"
          data={{ elements, indices: indicesForPanel }}
        />
      ) : (
        Object.keys(elements).map((elementId) => elements[elementId])
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

export type AutocompleteTemplates = {
  /**
   * Template to use for the panel.
   */
  panel?: Template<{
    elements: PanelElements;
    indices: AutocompleteRenderState['indices'];
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

type PanelElements = Partial<
  // eslint-disable-next-line @typescript-eslint/ban-types
  Record<'recent' | 'suggestions' | (string & {}), preact.JSX.Element>
>;

export type FeedConfig<TItem extends BaseHit> = {
  /**
   * ID of the feed in the composition response.
   */
  feedID: string;
  templates?: Partial<{
    header: Template<{ items: TItem[] }>;
    item: Template<{ item: TItem; onSelect: () => void }>;
    noResults: Template<Record<string, never>>;
  }>;
  cssClasses?: Partial<AutocompleteIndexClassNames>;
  getURL?: AutocompleteIndexConfig<TItem>['getURL'];
  getQuery?: AutocompleteIndexConfig<TItem>['getQuery'];
};

type IndicesShowQuerySuggestionsWidgetParams = Partial<
  Pick<
    IndexConfig<{ query: string }>,
    'indexName' | 'getURL' | 'templates' | 'cssClasses' | 'searchParameters'
  >
>;

type FeedsShowQuerySuggestionsWidgetParams = {
  feedID: string;
  getURL?: IndexConfig<{ query: string }>['getURL'];
  templates?: IndexConfig<{ query: string }>['templates'];
  cssClasses?: Partial<AutocompleteIndexClassNames>;
};

type IndicesShowPromptSuggestionsWidgetParams = Partial<
  Pick<
    IndexConfig<{ query: string; label?: string }>,
    'indexName' | 'getURL' | 'templates' | 'cssClasses' | 'searchParameters'
  >
>;

type FeedsShowPromptSuggestionsWidgetParams = {
  feedID: string;
  getURL?: IndexConfig<{ query: string; label?: string }>['getURL'];
  templates?: IndexConfig<{ query: string; label?: string }>['templates'];
  cssClasses?: Partial<AutocompleteIndexClassNames>;
};

type BaseAutocompleteWidgetParams<TItem extends BaseHit> = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

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

  transformItems?: (
    indices: TransformItemsIndicesConfig[]
  ) => TransformItemsIndicesConfig[];

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

export type IndicesAutocompleteWidgetParams<TItem extends BaseHit> =
  BaseAutocompleteWidgetParams<TItem> & {
    /**
     * Indices to use in the Autocomplete.
     */
    indices?: Array<IndexConfig<TItem>>;
    feeds?: never;
    /**
     * Index to use for retrieving and showing query suggestions.
     */
    showQuerySuggestions?: IndicesShowQuerySuggestionsWidgetParams;
    showPromptSuggestions?: IndicesShowPromptSuggestionsWidgetParams;
  };

export type FeedsAutocompleteWidgetParams<TItem extends BaseHit> =
  BaseAutocompleteWidgetParams<TItem> & {
    /**
     * Feeds to use in the Autocomplete. Drives the panel from a single
     * composition multifeed response. Requires the outer <InstantSearch>
     * to be composition-based (compositionID must be set).
     */
    feeds: Array<FeedConfig<TItem>>;
    indices?: never;
    /**
     * Feed to use for showing query suggestions.
     */
    showQuerySuggestions?: FeedsShowQuerySuggestionsWidgetParams;
    showPromptSuggestions?: FeedsShowPromptSuggestionsWidgetParams;
  };

type AutocompleteWidgetParams<TItem extends BaseHit> =
  | IndicesAutocompleteWidgetParams<TItem>
  | FeedsAutocompleteWidgetParams<TItem>;

export type AutocompleteWidget<TItem extends BaseHit = BaseHit> = WidgetFactory<
  AutocompleteWidgetDescription & { $$widgetType: 'ais.autocomplete' },
  AutocompleteConnectorParams,
  AutocompleteWidgetParams<TItem>
>;

export function EXPERIMENTAL_autocomplete<TItem extends BaseHit = BaseHit>(
  widgetParams: AutocompleteWidgetParams<TItem> & AutocompleteConnectorParams
) {
  const safeWidgetParams =
    widgetParams || ({} as AutocompleteWidgetParams<TItem>);
  const indices =
    'indices' in safeWidgetParams ? safeWidgetParams.indices : undefined;
  const feeds =
    'feeds' in safeWidgetParams ? safeWidgetParams.feeds : undefined;
  const isFeedsMode = feeds !== undefined;
  const {
    container,
    escapeHTML,
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
  } = safeWidgetParams;

  if (isFeedsMode && indices !== undefined) {
    throw new Error(
      withUsage(
        'The `feeds` and `indices` options are mutually exclusive.'
      )
    );
  }
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

  // In feeds-mode `indexName` carries the feedID so downstream matching
  // (section building, dedupe in createAutocompleteStorage) treats feeds
  // like indices without changes to the renderer / storage.
  const querySuggestionsKey = isFeedsMode
    ? (showQuerySuggestions as FeedsShowQuerySuggestionsWidgetParams | undefined)
        ?.feedID
    : (
        showQuerySuggestions as
          | IndicesShowQuerySuggestionsWidgetParams
          | undefined
      )?.indexName;
  const promptSuggestionsKey = isFeedsMode
    ? (
        showPromptSuggestions as FeedsShowPromptSuggestionsWidgetParams | undefined
      )?.feedID
    : (
        showPromptSuggestions as
          | IndicesShowPromptSuggestionsWidgetParams
          | undefined
      )?.indexName;

  const indicesConfig: Array<IndexConfig<TItem>> = isFeedsMode
    ? feeds.map((feed) => ({
        indexName: feed.feedID,
        templates: feed.templates as IndexConfig<TItem>['templates'],
        cssClasses: feed.cssClasses,
        getURL: feed.getURL,
        getQuery: feed.getQuery,
      }))
    : [...(indices ?? [])];
  if (querySuggestionsKey) {
    const querySuggestionsSearchParameters = isFeedsMode
      ? undefined
      : {
          hitsPerPage: 3,
          ...(showQuerySuggestions as IndicesShowQuerySuggestionsWidgetParams)
            .searchParameters,
        };
    indicesConfig.unshift({
      indexName: querySuggestionsKey,
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
        ...showQuerySuggestions!.templates,
      },
      cssClasses: {
        root: cx(
          'ais-AutocompleteSuggestions',
          showQuerySuggestions?.cssClasses?.root
        ),
        list: cx(
          'ais-AutocompleteSuggestionsList',
          showQuerySuggestions?.cssClasses?.list
        ),
        header: cx(
          'ais-AutocompleteSuggestionsHeader',
          showQuerySuggestions?.cssClasses?.header
        ),
        item: cx(
          'ais-AutocompleteSuggestionsItem',
          showQuerySuggestions?.cssClasses?.item
        ),
      },
      searchParameters: querySuggestionsSearchParameters,
      getQuery: (item) => item.query,
      getURL:
        showQuerySuggestions!.getURL as unknown as IndexConfig<TItem>['getURL'],
    });
  }
  if (promptSuggestionsKey) {
    const promptSuggestionsSearchParameters = isFeedsMode
      ? undefined
      : {
          hitsPerPage: 3,
          ...(showPromptSuggestions as IndicesShowPromptSuggestionsWidgetParams)
            .searchParameters,
        };
    indicesConfig.push({
      indexName: promptSuggestionsKey,
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
        ...showPromptSuggestions!.templates,
      },
      cssClasses: {
        root: cx(
          'ais-AutocompletePromptSuggestions',
          showPromptSuggestions?.cssClasses?.root
        ),
        list: cx(
          'ais-AutocompletePromptSuggestionsList',
          showPromptSuggestions?.cssClasses?.list
        ),
        header: cx(
          'ais-AutocompletePromptSuggestionsHeader',
          showPromptSuggestions?.cssClasses?.header
        ),
        item: cx(
          'ais-AutocompletePromptSuggestionsItem',
          showPromptSuggestions?.cssClasses?.item
        ),
      },
      searchParameters: promptSuggestionsSearchParameters,
      getQuery: (item) => item.prompt,
      getURL:
        showPromptSuggestions!.getURL as unknown as IndexConfig<TItem>['getURL'],
    });
  }

  // Normalize `show*` for downstream dedupe/section-matching: in feeds-mode
  // re-expose `indexName` carrying the feedID so the existing code path
  // (suggestionsIndexName === index.indexName in createAutocompleteStorage) works.
  const normalizedShowQuerySuggestions:
    | IndicesShowQuerySuggestionsWidgetParams
    | undefined = showQuerySuggestions
    ? isFeedsMode
      ? { ...showQuerySuggestions, indexName: querySuggestionsKey }
      : (showQuerySuggestions as IndicesShowQuerySuggestionsWidgetParams)
    : undefined;
  const normalizedShowPromptSuggestions:
    | IndicesShowPromptSuggestionsWidgetParams
    | undefined = showPromptSuggestions
    ? isFeedsMode
      ? { ...showPromptSuggestions, indexName: promptSuggestionsKey }
      : (showPromptSuggestions as IndicesShowPromptSuggestionsWidgetParams)
    : undefined;

  // connectAutocomplete sets `indices[i].indexName = scopedResult.results.index`,
  // which isn't a feedID for FeedContainer-derived results. In feeds-mode we
  // rewrite `indexName := indexId` (indexId comes from FeedContainer.getIndexId
  // and equals the feedID) before the user's transformItems runs.
  const effectiveTransformItems: typeof transformItems = isFeedsMode
    ? (items) => {
        const remapped = items.map((item) => ({
          ...item,
          indexName: item.indexId,
        }));
        return transformItems ? transformItems(remapped) : remapped;
      }
    : transformItems;

  const instanceId = ++autocompleteInstanceId;
  const shouldShowRecent = showRecent || undefined;
  const showRecentOptions =
    typeof shouldShowRecent === 'boolean' ? {} : shouldShowRecent;

  const translations: AutocompleteTranslations = {
    ...DEFAULT_TRANSLATIONS,
    ...userTranslations,
  };

  const specializedRenderer = createRenderer({
    instanceId,
    containerNode,
    indicesConfig,
    getSearchPageURL,
    onSelect,
    cssClasses,
    showRecent: showRecentOptions,
    showQuerySuggestions: normalizedShowQuerySuggestions,
    showPromptSuggestions: normalizedShowPromptSuggestions,
    placeholder,
    autofocus,
    detachedMediaQuery,
    translations,
    renderState: {
      indexTemplateProps: [],
      isolatedIndex: undefined,
      targetIndex: undefined,
      templateProps: undefined,
      RecentSearchComponent: AutocompleteRecentSearch,
      recentSearchHeaderComponent: undefined,
      hasWarnedMissingPromptSuggestionsChat: false,
    },
    templates,
    aiMode,
  });

  const makeWidget = connectAutocomplete(specializedRenderer, () =>
    render(null, containerNode)
  );

  if (isFeedsMode) {
    // Defer tree construction to `init`: we need `compositionID` from the
    // InstantSearch instance, which isn't available at factory time.
    // Pre-register FeedContainers (rather than letting `feeds()` create them
    // lazily on render) to avoid a redundant composition search when the
    // containers are added after the first results land.
    const feedIDs: string[] = [
      ...(querySuggestionsKey ? [querySuggestionsKey] : []),
      ...feeds.map((feed) => feed.feedID),
      ...(promptSuggestionsKey ? [promptSuggestionsKey] : []),
    ];

    if (__DEV__) {
      const seen = new Set<string>();
      const duplicates = new Set<string>();
      feedIDs.forEach((id) => {
        if (seen.has(id)) {
          duplicates.add(id);
        } else {
          seen.add(id);
        }
      });
      if (duplicates.size > 0) {
        warn(
          `Duplicate feedID(s) detected in autocomplete configuration: ${[
            ...duplicates,
          ]
            .map((d) => `"${d}"`)
            .join(
              ', '
            )}. Each \`feeds[]\` entry, \`showQuerySuggestions\`, and \`showPromptSuggestions\` must use a unique feedID.`
        );
      }
    }

    let bootstrappedTree: IndexWidget | null = null;
    const bootstrap: Widget = {
      $$type: 'ais.autocomplete',
      $$widgetType: 'ais.autocomplete',
      init({ instantSearchInstance, parent }) {
        if (!instantSearchInstance.compositionID) {
          throw new Error(
            withUsage(
              'feeds-mode requires a composition-based InstantSearch instance (compositionID must be set).'
            )
          );
        }
        bootstrappedTree = index({
          indexName: instantSearchInstance.compositionID,
          indexId: `ais-autocomplete-${instanceId}`,
          EXPERIMENTAL_isolated: true,
        });
        const feedContainers = feedIDs.map((feedID) =>
          createFeedContainer(feedID, bootstrappedTree!, instantSearchInstance)
        );
        bootstrappedTree.addWidgets([
          configure(searchParameters),
          // Connector-only registration runs `hydrateFeedsFromInitialResultsIfNeeded`
          // at init for SSR, without triggering the extra search `feeds()` would.
          connectFeeds(noop, noop)({ searchScope: 'global' }),
          ...feedContainers,
          {
            ...makeWidget({
              escapeHTML,
              transformItems: effectiveTransformItems,
            }),
            $$widgetType: 'ais.autocomplete',
          },
        ]);
        parent?.addWidgets([bootstrappedTree]);
      },
      render() {},
      dispose({ parent }) {
        if (bootstrappedTree) {
          parent?.removeWidgets([bootstrappedTree]);
          bootstrappedTree = null;
        }
        return undefined;
      },
    };
    return [connectSearchBox(() => null)({}), bootstrap];
  }

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
      {
        ...makeWidget({
          escapeHTML,
          transformItems: effectiveTransformItems,
          future: { undefinedEmptyQuery: true },
        }),
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
