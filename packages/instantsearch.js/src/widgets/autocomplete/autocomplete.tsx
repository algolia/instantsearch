/** @jsx h */

import {
  createAutocompleteComponent,
  createAutocompleteDetachedContainerComponent,
  createAutocompleteDetachedOverlayComponent,
  createAutocompleteDetachedFormContainerComponent,
  createAutocompleteDetachedSearchButtonComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompletePropGetters,
  createAutocompleteRecentSearchComponent,
  createAutocompleteSearchComponent,
  createAutocompleteStorage,
  createAutocompleteSuggestionComponent,
  cx,
} from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';
import { useEffect, useId, useMemo, useRef, useState } from 'preact/hooks';

import TemplateComponent from '../../components/Template/Template';
import {
  connectAutocomplete,
  connectSearchBox,
} from '../../connectors/index.umd';
import { ReverseHighlight } from '../../helpers/components';
import { component } from '../../lib/suit';
import { prepareTemplateProps } from '../../lib/templating';
import {
  createDocumentationMessageGenerator,
  find,
  getContainerNode,
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
  };
  detachedMediaQuery: string | undefined;
  translations: AutocompleteTranslations;
} & Pick<
  AutocompleteWidgetParams<TItem>,
  'getSearchPageURL' | 'onSelect' | 'showSuggestions' | 'placeholder'
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
  | 'showSuggestions'
  | 'placeholder'
  | 'detachedMediaQuery'
  | 'translations'
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
  showSuggestions,
  templates,
  placeholder,
  detachedMediaQuery,
  translations,
}: AutocompleteWrapperProps<TItem>) {
  const { isolatedIndex, targetIndex } = renderState;

  const searchboxQuery = isolatedIndex?.getHelper()?.state.query;
  const targetIndexQuery = targetIndex?.getHelper()?.state.query;

  // Local query state for immediate updates (especially for detached search button)
  const [localQuery, setLocalQuery] = useState(
    searchboxQuery || targetIndexQuery || ''
  );

  // Sync local query with searchbox query when it changes externally
  useEffect(() => {
    // If the isolated index has a query, use it (user typing).
    // If not, fall back to the target index query (URL/main state).
    const query = searchboxQuery || targetIndexQuery;
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
    typeof window !== 'undefined' && resolvedDetachedMediaQuery
      ? window.matchMedia(resolvedDetachedMediaQuery).matches
      : false
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDetached, setIsModalDetached] = useState(false);

  // Media query listener for detached mode
  useEffect(() => {
    if (typeof window === 'undefined' || !resolvedDetachedMediaQuery) {
      setIsDetached(false);
      return () => {};
    }

    const mql = window.matchMedia(resolvedDetachedMediaQuery);
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
    suggestionsIndexName: showSuggestions?.indexName,
  });
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

  const {
    getInputProps,
    getItemProps,
    getPanelProps,
    getRootProps,
    isOpen,
    setIsOpen,
    focusInput,
  } = usePropGetters({
    indices: indicesForPropGetters,
    indicesConfig: indicesConfigForPropGetters,
    onRefine,
    onSelect:
      userOnSelect ??
      (({ query, setQuery, url }) => {
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

  indices.forEach(({ indexId, indexName, hits }, i) => {
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

    const elementId =
      indexName === showSuggestions?.indexName ? 'suggestions' : indexName;

    const filteredHits =
      elementId === 'suggestions' && showRecent
        ? hits.filter(
            (suggestionHit) =>
              !find(
                storageHits,
                (storageHit) => storageHit.query === suggestionHit.query
              )
          )
        : hits;

    elements[elementId] = (
      <AutocompleteIndex
        key={indexId}
        HeaderComponent={headerComponent}
        ItemComponent={itemComponent}
        items={filteredHits.map((item) => ({
          ...item,
          __indexName: indexId,
        }))}
        getItemProps={getItemProps}
        classNames={currentIndexConfig.cssClasses}
      />
    );
  });

  const searchBoxContent = (
    <AutocompleteSearchBox
      query={localQuery}
      inputProps={{
        ...getInputProps(),
        onInput: (event) => {
          const query = (event.currentTarget as HTMLInputElement).value;
          setLocalQuery(query);
          refineAutocomplete(query);
        },
      }}
      onClear={() => {
        onRefine('');
      }}
      isSearchStalled={instantSearchInstance.status === 'stalled'}
    />
  );

  const panelContent = (
    <AutocompletePanel {...getPanelProps()}>
      {templates.panel ? (
        <TemplateComponent
          {...renderState.templateProps}
          templateKey="panel"
          rootTagName="fragment"
          data={{ elements, indices }}
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

  if (isDetached) {
    return (
      <Autocomplete {...getRootProps()} classNames={cssClasses}>
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
            onClose={() => {
              setIsModalOpen(false);
              setIsOpen(false);
            }}
          >
            <AutocompleteDetachedContainer
              classNames={detachedContainerCssClasses}
            >
              <AutocompleteDetachedFormContainer
                classNames={cssClasses}
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
    <Autocomplete {...getRootProps()} classNames={cssClasses}>
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

type AutocompleteWidgetParams<TItem extends BaseHit> = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Indices to use in the Autocomplete.
   */
  indices?: Array<IndexConfig<TItem>>;

  /**
   * Index to use for retrieving and showing query suggestions.
   */
  showSuggestions?: Partial<
    Pick<
      IndexConfig<{ query: string }>,
      'indexName' | 'getURL' | 'templates' | 'cssClasses'
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
    indices = [],
    showSuggestions,
    showRecent,
    searchParameters: userSearchParameters,
    getSearchPageURL,
    onSelect,
    templates = {},
    transformItems,
    cssClasses: userCssClasses = {},
    placeholder,
    detachedMediaQuery,
    translations: userTranslations = {},
  } = widgetParams || {};

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

  const indicesConfig = [...indices];
  if (showSuggestions?.indexName) {
    indicesConfig.unshift({
      indexName: showSuggestions.indexName,
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
        ...showSuggestions.templates,
      },
      cssClasses: {
        root: cx(
          'ais-AutocompleteSuggestions',
          showSuggestions.cssClasses?.root
        ),
        list: cx(
          'ais-AutocompleteSuggestionsList',
          showSuggestions.cssClasses?.list
        ),
        header: cx(
          'ais-AutocompleteSuggestionsHeader',
          showSuggestions.cssClasses?.header
        ),
        item: cx(
          'ais-AutocompleteSuggestionsItem',
          showSuggestions.cssClasses?.item
        ),
      },
      getQuery: (item) => item.query,
      getURL: showSuggestions.getURL as unknown as IndexConfig<TItem>['getURL'],
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

  const specializedRenderer = createRenderer({
    instanceId,
    containerNode,
    indicesConfig,
    getSearchPageURL,
    onSelect,
    cssClasses,
    showRecent: showRecentOptions,
    showSuggestions,
    placeholder,
    detachedMediaQuery,
    translations,
    renderState: {
      indexTemplateProps: [],
      isolatedIndex: undefined,
      targetIndex: undefined,
      templateProps: undefined,
      RecentSearchComponent: AutocompleteRecentSearch,
      recentSearchHeaderComponent: undefined,
    },
    templates,
  });

  const makeWidget = connectAutocomplete(specializedRenderer, () =>
    render(null, containerNode)
  );

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
        ...makeWidget({ escapeHTML, transformItems }),
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
