import {
  createAutocompleteComponent,
  createAutocompleteDetachedContainerComponent,
  createAutocompleteDetachedFormContainerComponent,
  createAutocompleteDetachedOverlayComponent,
  createAutocompleteDetachedSearchButtonComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompletePromptSuggestionComponent,
  createAutocompletePropGetters,
  createAutocompleteRecentSearchComponent,
  createAutocompleteSearchComponent,
  createAutocompleteStorage,
  createAutocompleteSuggestionComponent,
  createHighlightComponent,
  cx,
  getPromptSuggestionHits,
  isPromptSuggestion,
} from 'instantsearch-ui-components';
import { createFeedContainer } from 'instantsearch.js/es/connectors/feeds/FeedContainer';
import {
  connectAutocomplete,
  connectFeeds,
  connectSearchBox,
} from 'instantsearch.js/es/connectors/index';
import { isChatBusy, openChat } from 'instantsearch.js/es/lib/chat';
import {
  find,
  getHighlightedParts,
  noop,
  unescape,
} from 'instantsearch.js/es/lib/utils';

import { createHooksMixin } from '../mixins/hooks';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import {
  Fragment,
  getScopedSlot,
  isVue3,
  renderCompat,
  renderReactCompat,
} from '../util/vue-compat';
import { warn } from '../util/warn';

import AisConfigure from './Configure';
import AisIndex from './Index';

let autocompleteInstanceId = 0;

const DEFAULT_DETACHED_MEDIA_QUERY = '(max-width: 680px)';
const DEFAULT_DETACHED_MODAL_MEDIA_QUERY = '(min-width: 680px)';
const DETACHED_MEDIA_QUERY_CSS_VAR = '--ais-autocomplete-detached-media-query';
const DETACHED_MODAL_MEDIA_QUERY_CSS_VAR =
  '--ais-autocomplete-detached-modal-media-query';
const DEFAULT_TRANSLATIONS = {
  detachedCancelButtonText: 'Cancel',
  detachedSearchButtonTitle: 'Search',
  detachedClearButtonTitle: 'Clear',
};

function getCssMediaQueryValue(name) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '';
  }

  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function resolveMediaQuery(value, cssVarName, fallback) {
  if (value === '') {
    return '';
  }

  if (value) {
    return value;
  }

  return getCssMediaQueryValue(cssVarName) || fallback;
}

function getMediaQueryList(mediaQuery) {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return null;
  }

  return window.matchMedia(mediaQuery);
}

function createUiComponents(createElement) {
  const renderer = { createElement, Fragment };

  return {
    Autocomplete: createAutocompleteComponent(renderer),
    Panel: createAutocompletePanelComponent(renderer),
    Index: createAutocompleteIndexComponent(renderer),
    Suggestion: createAutocompleteSuggestionComponent(renderer),
    PromptSuggestion: createAutocompletePromptSuggestionComponent(renderer),
    SearchBox: createAutocompleteSearchComponent(renderer),
    RecentSearch: createAutocompleteRecentSearchComponent(renderer),
    DetachedContainer: createAutocompleteDetachedContainerComponent(renderer),
    DetachedOverlay: createAutocompleteDetachedOverlayComponent(renderer),
    DetachedFormContainer:
      createAutocompleteDetachedFormContainerComponent(renderer),
    DetachedSearchButton:
      createAutocompleteDetachedSearchButtonComponent(renderer),
    Highlight: createHighlightComponent(renderer),
  };
}

function renderConditionalHighlight(
  createElement,
  Highlight,
  { item, attribute, reverse }
) {
  const result = item._highlightResult && item._highlightResult[attribute];

  if (!result || result.matchLevel === 'none') {
    return item[attribute];
  }

  const prefix = reverse ? 'ais-ReverseHighlight' : 'ais-Highlight';
  const parts = [
    getHighlightedParts(unescape(result.value || '')).map(
      ({ value, isHighlighted }) => ({
        // Vue gets rid of TextNodes with a single white space
        value: value === ' ' ? '  ' : value,
        isHighlighted: reverse ? !isHighlighted : isHighlighted,
      })
    ),
  ];

  return createElement(Highlight, {
    parts,
    highlightedTagName: 'mark',
    nonHighlightedTagName: 'span',
    classNames: {
      root: prefix,
      highlighted: `${prefix}-highlighted`,
      nonHighlighted: `${prefix}-nonHighlighted`,
      separator: `${prefix}-separator`,
    },
  });
}

function isFeedsMode(vm) {
  return Boolean(vm.feeds);
}

function getSuggestionsKey(vm, config) {
  if (!config) return undefined;
  return isFeedsMode(vm) ? config.feedID : config.indexName;
}

/**
 * Builds the list of indices (or feeds) the panel renders, prepending query
 * suggestions and appending prompt suggestions, mirroring the JS widget.
 */
function buildIndicesConfig(vm) {
  const feedsMode = isFeedsMode(vm);
  const querySuggestionsKey = getSuggestionsKey(vm, vm.showQuerySuggestions);
  const promptSuggestionsKey = getSuggestionsKey(vm, vm.showPromptSuggestions);

  const indicesConfig = feedsMode
    ? vm.feeds.map((feed) => ({
        indexName: feed.feedID,
        classNames: feed.classNames,
        getURL: feed.getURL,
        getQuery: feed.getQuery,
      }))
    : [...(vm.indices || [])];

  if (querySuggestionsKey) {
    const config = vm.showQuerySuggestions;
    indicesConfig.unshift({
      indexName: querySuggestionsKey,
      kind: 'querySuggestions',
      classNames: {
        root: cx('ais-AutocompleteSuggestions', config.classNames?.root),
        list: cx('ais-AutocompleteSuggestionsList', config.classNames?.list),
        header: cx(
          'ais-AutocompleteSuggestionsHeader',
          config.classNames?.header
        ),
        item: cx('ais-AutocompleteSuggestionsItem', config.classNames?.item),
      },
      searchParameters: feedsMode
        ? undefined
        : { hitsPerPage: 3, ...config.searchParameters },
      getQuery: (item) => item.query,
      getURL: config.getURL,
    });
  }

  if (promptSuggestionsKey) {
    const config = vm.showPromptSuggestions;
    indicesConfig.push({
      indexName: promptSuggestionsKey,
      kind: 'promptSuggestions',
      classNames: {
        root: cx('ais-AutocompletePromptSuggestions', config.classNames?.root),
        list: cx(
          'ais-AutocompletePromptSuggestionsList',
          config.classNames?.list
        ),
        header: cx(
          'ais-AutocompletePromptSuggestionsHeader',
          config.classNames?.header
        ),
        item: cx(
          'ais-AutocompletePromptSuggestionsItem',
          config.classNames?.item
        ),
      },
      searchParameters: feedsMode
        ? undefined
        : { hitsPerPage: 3, ...config.searchParameters },
      getQuery: (item) => item.prompt,
      getURL: config.getURL,
    });
  }

  return indicesConfig;
}

/**
 * Registers `connectAutocomplete` in the isolated index (the closest
 * `<ais-index>`) and hands its render state to the autocomplete, which owns
 * the markup and the hooks state.
 */
const AutocompleteConnector = {
  name: 'AisExperimentalAutocompleteConnector',
  mixins: [
    createWidgetMixin(
      { connector: connectAutocomplete },
      { $$widgetType: 'ais.autocomplete' }
    ),
  ],
  props: {
    widgetParams: { type: Object, required: true },
    handleRender: { type: Function, required: true },
    handleMount: { type: Function, required: true },
  },
  mounted() {
    this.handleMount(this.getParentIndex());
  },
  methods: {
    // Overrides the widget mixin: the render state contains Helper and
    // SearchResults instances, which are kept out of Vue's reactivity.
    updateState(renderOptions) {
      this.handleRender(renderOptions);
    },
  },
  render() {
    return null;
  },
};

/**
 * Registers the feeds of the closest `<ais-index>` (the composition-based
 * isolated index): the feed containers need the index widget itself, so they
 * can't be described with components.
 */
const AutocompleteFeeds = {
  name: 'AisExperimentalAutocompleteFeeds',
  inject: {
    instantSearchInstance: { from: '$_ais_instantSearchInstance' },
    getParentIndex: { from: '$_ais_getParentIndex' },
  },
  props: {
    feedIDs: { type: Array, required: true },
  },
  created() {
    const tree = this.getParentIndex();
    this.widgets = [
      // Connector-only registration runs `hydrateFeedsFromInitialResultsIfNeeded`
      // at init for SSR, without triggering the extra search `feeds()` would.
      connectFeeds(noop, noop)({ isolated: false }),
      ...this.feedIDs.map((feedID) =>
        createFeedContainer(feedID, tree, this.instantSearchInstance)
      ),
    ];
    tree.addWidgets(this.widgets);
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    this.getParentIndex().removeWidgets(this.widgets);
  },
  render() {
    return null;
  },
};

/**
 * The isolated index subtree, rendered once the input is focused. It's a
 * component of its own because `AisIndex` and `AisConfigure` need Vue-style
 * data (`props`, `attrs`, `scopedSlots`) that the React-style `createElement`
 * of the autocomplete render doesn't produce, and because that `createElement`
 * would turn `on*` function props into listeners: hence `handleRender` and
 * `handleMount`.
 */
const IsolatedIndex = {
  name: 'AisExperimentalAutocompleteIsolatedIndex',
  props: {
    tree: { type: Object, required: true },
    handleRender: { type: Function, required: true },
    handleMount: { type: Function, required: true },
  },
  render: renderCompat(function (h) {
    const { tree } = this;
    const children = [
      h(AisConfigure, { key: 'configure', attrs: tree.searchParameters }),
      ...tree.indices.map((config) =>
        h(
          AisIndex,
          {
            key: config.indexId,
            props: { indexName: config.indexName, indexId: config.indexId },
            scopedSlots: {},
          },
          h(AisConfigure, { attrs: config.searchParameters })
        )
      ),
      tree.feedIDs &&
        h(AutocompleteFeeds, {
          key: 'feeds',
          props: { feedIDs: tree.feedIDs },
        }),
      h(AutocompleteConnector, {
        key: 'connector',
        props: {
          widgetParams: tree.connectorParams,
          handleRender: this.handleRender,
          handleMount: this.handleMount,
        },
      }),
    ].filter(Boolean);

    return h(
      AisIndex,
      {
        props: {
          indexName: tree.indexName || undefined,
          indexId: tree.indexId,
          isolated: true,
        },
        attrs: { hidden: true },
        // A function default slot avoids Vue 3's non-function slot warning.
        scopedSlots: {},
      },
      ...children
    );
  }),
};

/**
 * Experimental Autocomplete widget.
 *
 * It composes `connectAutocomplete` with the shared `instantsearch-ui-components`
 * markup, exactly like the `autocomplete` widget of InstantSearch.js and the
 * `<Autocomplete>` widget of React InstantSearch.
 *
 * The suggestions are searched in an isolated `<ais-index>` subtree, which is
 * only rendered once the input is focused (or `autofocus` is set), so like in
 * the other flavors nothing is searched before. The widget options are read
 * when the widget is created and are not reactive.
 *
 * `showPromptSuggestions` and `aiMode` hand the query off to an `<ais-chat>`
 * in the same index. Without one the AI mode button only closes the panel.
 *
 * Like `AisCarousel` and `AisChat`, the markup comes from the shared
 * `instantsearch-ui-components` factories, driven by this component's own
 * hooks store (see the "hook-based shared components" section of CLAUDE.md).
 */
export default {
  name: 'AisExperimentalAutocomplete',
  mixins: [createSuitMixin({ name: 'Autocomplete' }), createHooksMixin()],
  inject: {
    instantSearchInstance: {
      from: '$_ais_instantSearchInstance',
      default() {
        const tag = this.$options._componentTag;
        throw new TypeError(
          `It looks like you forgot to wrap your Algolia search component "<${tag}>" inside of an "<ais-instant-search>" component.`
        );
      },
    },
    getParentIndex: {
      from: '$_ais_getParentIndex',
      default() {
        return () => this.instantSearchInstance.mainIndex;
      },
    },
  },
  props: {
    indices: { type: Array, default: undefined },
    feeds: { type: Array, default: undefined },
    showQuerySuggestions: { type: Object, default: undefined },
    showPromptSuggestions: { type: Object, default: undefined },
    showRecent: { type: [Boolean, Object], default: false },
    searchParameters: { type: Object, default: undefined },
    requiresSearch: { type: Boolean, default: true },
    escapeHTML: { type: Boolean, default: true },
    getSearchPageUrl: { type: Function, default: undefined },
    onSelect: { type: Function, default: undefined },
    transformItems: { type: Function, default: undefined },
    placeholder: { type: String, default: undefined },
    autofocus: { type: Boolean, default: false },
    detachedMediaQuery: { type: String, default: undefined },
    translations: { type: Object, default: undefined },
    aiMode: { type: Boolean, default: false },
    // Overrides the `classNames` prop of the suit mixin: the keys are the ones
    // of the other flavors' `cssClasses` (`root`, `panel`, `panelOpen`, ...).
    classNames: { type: Object, default: () => ({}) },
  },
  created() {
    if (this.feeds && this.indices) {
      throw new Error(
        'The `feeds` and `indices` options of <ais-experimental-autocomplete> are mutually exclusive.'
      );
    }

    // Non-reactive state: the render state contains Helper and SearchResults
    // instances that should not be observed by Vue.
    this.$_ais = {
      instanceId: ++autocompleteInstanceId,
      mounted: false,
      // Whether the isolated index subtree is rendered.
      activated: false,
      // The isolated index, once its connector is mounted.
      isolatedIndex: null,
      // A query typed between activation and the connector's first render.
      pendingQuery: undefined,
      renderOptions: null,
      hasWarnedMissingPromptSuggestionsChat: false,
    };

    if (isFeedsMode(this) && !this.instantSearchInstance.compositionID) {
      throw new Error(
        'feeds-mode of <ais-experimental-autocomplete> requires a composition-based InstantSearch instance (compositionID must be set).'
      );
    }

    this.$_aisIndicesConfig = buildIndicesConfig(this);
    this.$_aisTree = this.createTreeConfig();

    // The searchbox companion syncs the query of the parent index.
    this.widget = {
      ...connectSearchBox(({ instantSearchInstance }, isFirstRender) => {
        // Render the shell once the parent index is initialized: the search
        // only starts once the input is focused.
        if (isFirstRender && !this.$_ais.renderOptions) {
          this.updateRenderOptions({
            instantSearchInstance,
            indices: [],
            refine: noop,
            currentRefinement: '',
            widgetParams: {},
          });
        }
      })({}),
      $$widgetType: 'ais.autocomplete',
      dependsOn: this.requiresSearch ? 'search' : 'none',
      // On the always-mounted companion (like React), so the chat's entry point
      // check passes before the isolated index is first rendered.
      ...(this.aiMode ? { opensChat: true } : {}),
    };
    this.getParentIndex().addWidgets([this.widget]);
  },
  mounted() {
    this.$_ais.mounted = true;
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    // The isolated index subtree removes itself when it's unmounted.
    this.getParentIndex().removeWidgets([this.widget]);
    this.$_ais.mounted = false;
  },
  methods: {
    requestRender() {
      if (this.$_ais.mounted) {
        this.$forceUpdate();
      }
    },
    updateRenderOptions(renderOptions) {
      this.$_ais.renderOptions = renderOptions;
      this.requestRender();
    },
    activate() {
      if (this.$_ais.activated) {
        return;
      }

      this.$_ais.activated = true;
      // Renders the isolated index subtree.
      this.requestRender();
    },
    handleConnectorMount(isolatedIndex) {
      const state = this.$_ais;
      state.isolatedIndex = isolatedIndex;
      // Adding the isolated index schedules the parent's search even though
      // the parent's own state hasn't changed; cancel it so only the isolated
      // index searches.
      this.instantSearchInstance.scheduleSearch.cancel();
      const query =
        state.pendingQuery !== undefined
          ? state.pendingQuery
          : this.getParentIndex().getHelper()?.state.query;
      state.pendingQuery = undefined;
      if (query) {
        isolatedIndex.getHelper()?.setQuery(query);
      }
      isolatedIndex.scheduleLocalSearch();
    },
    createTreeConfig() {
      const feedsMode = isFeedsMode(this);
      const indexId = `ais-autocomplete-${this.$_ais.instanceId}`;
      const querySuggestionsKey = getSuggestionsKey(
        this,
        this.showQuerySuggestions
      );
      const promptSuggestionsKey = getSuggestionsKey(
        this,
        this.showPromptSuggestions
      );

      // In feeds-mode `connectAutocomplete` sets `indexName` from the result
      // index, which is not the feedID: remap it before the user's transform.
      const transformItems = feedsMode
        ? (items) => {
            const remapped = items.map((item) => ({
              ...item,
              indexName: item.indexId,
            }));
            return this.transformItems
              ? this.transformItems(remapped)
              : remapped;
          }
        : this.transformItems;

      // The objects are created once: new objects on every render would make
      // `<ais-configure>` and the connector re-register their widgets.
      return {
        indexId,
        indexName: feedsMode ? this.instantSearchInstance.compositionID : '',
        searchParameters: { hitsPerPage: 5, ...this.searchParameters },
        indices: feedsMode
          ? []
          : this.$_aisIndicesConfig.map(
              ({ indexName, searchParameters = {} }) => ({
                indexName,
                indexId: `${indexId}-${indexName}`,
                searchParameters,
              })
            ),
        feedIDs: feedsMode
          ? [
              ...(querySuggestionsKey ? [querySuggestionsKey] : []),
              ...this.feeds.map((feed) => feed.feedID),
              ...(promptSuggestionsKey ? [promptSuggestionsKey] : []),
            ]
          : null,
        connectorParams: {
          escapeHTML: this.escapeHTML,
          transformItems,
          future: { undefinedEmptyQuery: true },
        },
      };
    },
    renderAutocomplete(createElement, renderOptions, isolatedIndexContent) {
      const state = this.$_ais;
      const { useEffect, useMemo, useRef, useState } = this.hooksStore.hooks;
      const ui = this.getUiComponent('ui', () =>
        createUiComponents(createElement)
      );
      const usePropGetters = this.getUiComponent('propGetters', () =>
        createAutocompletePropGetters(this.hooksStore.hooks)
      );
      const useStorage = this.getUiComponent('storage', () =>
        createAutocompleteStorage(this.hooksStore.hooks)
      );
      const { indices, instantSearchInstance } = renderOptions;
      // Vue re-renders asynchronously, so handlers created for the shell render
      // (with a no-op `refine`) can still run right after activation. Always
      // read the latest `refine`, like the synchronous Preact render in JS.
      const refineAutocomplete = (query) => {
        if (state.isolatedIndex) {
          state.renderOptions.refine(query);
        } else if (state.activated) {
          state.pendingQuery = query;
        }
      };
      const indicesConfig = this.$_aisIndicesConfig;

      const showRecent = this.showRecent
        ? this.showRecent === true
          ? {}
          : this.showRecent
        : undefined;
      const querySuggestionsKey = getSuggestionsKey(
        this,
        this.showQuerySuggestions
      );
      const promptSuggestionsKey = getSuggestionsKey(
        this,
        this.showPromptSuggestions
      );
      const promptSuggestionsLimit =
        this.showPromptSuggestions?.searchParameters?.hitsPerPage ?? 3;
      const translations = { ...DEFAULT_TRANSLATIONS, ...this.translations };
      const cssClasses = {
        ...this.classNames,
        root: cx('ais-Autocomplete', this.classNames.root),
      };

      const targetIndex = this.getParentIndex();
      const isolatedIndex = state.isolatedIndex || targetIndex;

      const searchboxQuery = isolatedIndex?.getHelper()?.state.query;
      const targetIndexQuery = targetIndex?.getHelper()?.state.query;

      const [localQuery, setLocalQuery] = useState(
        searchboxQuery !== undefined ? searchboxQuery : (targetIndexQuery ?? '')
      );

      useEffect(() => {
        // When the isolated index has a defined query (including ''), use it.
        // Only fall back to the target index query when not yet set.
        const query =
          searchboxQuery !== undefined ? searchboxQuery : targetIndexQuery;
        if (query !== undefined) {
          setLocalQuery(query);
        }
      }, [searchboxQuery, targetIndexQuery]);

      const resolvedDetachedMediaQuery = useMemo(
        () =>
          resolveMediaQuery(
            this.detachedMediaQuery,
            DETACHED_MEDIA_QUERY_CSS_VAR,
            DEFAULT_DETACHED_MEDIA_QUERY
          ),
        [this.detachedMediaQuery]
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

        const handler = (event) => {
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
        const mql = modalMediaQuery && getMediaQueryList(modalMediaQuery);
        if (!mql) {
          setIsModalDetached(false);
          return () => {};
        }

        const handler = (event) => setIsModalDetached(event.matches);

        setIsModalDetached(mql.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
      }, [isDetached]);

      // Body class management for scroll prevention
      useEffect(() => {
        if (typeof document === 'undefined' || !isModalOpen) {
          return () => {};
        }

        const { scrollY } = window;
        document.body.style.top = `-${scrollY}px`;
        document.body.classList.add('ais-Autocomplete--detached');

        return () => {
          document.body.classList.remove('ais-Autocomplete--detached');
          document.body.style.top = '';
          window.scrollTo(0, scrollY);
        };
      }, [isModalOpen]);

      const {
        storage,
        storageHits,
        indicesConfigForPropGetters,
        indicesForPropGetters,
      } = useStorage({
        query: searchboxQuery,
        showRecent,
        indices,
        indicesConfig,
        suggestionsIndexName: querySuggestionsKey,
      });

      const indicesForPanel = indices.map((autocompleteIndex) => {
        const dedupedHits =
          autocompleteIndex.indexName === querySuggestionsKey && showRecent
            ? autocompleteIndex.hits.filter(
                (suggestionHit) =>
                  !find(
                    storageHits,
                    (storageHit) => storageHit.query === suggestionHit.query
                  )
              )
            : autocompleteIndex.hits;

        if (autocompleteIndex.indexName !== promptSuggestionsKey) {
          return { ...autocompleteIndex, hits: dedupedHits };
        }

        return {
          ...autocompleteIndex,
          hits: getPromptSuggestionHits({
            hits: dedupedHits,
            limit: promptSuggestionsLimit,
          }),
        };
      });
      const indicesForPropGettersWithPromptSuggestions =
        indicesForPropGetters.map((autocompleteIndex) =>
          autocompleteIndex.indexName !== promptSuggestionsKey
            ? autocompleteIndex
            : {
                ...autocompleteIndex,
                hits: getPromptSuggestionHits({
                  hits: autocompleteIndex.hits,
                  limit: promptSuggestionsLimit,
                }),
              }
        );

      const recentSearchCssClasses = {
        root: cx(
          'ais-AutocompleteRecentSearches',
          showRecent?.classNames?.root
        ),
        list: cx(
          'ais-AutocompleteRecentSearchesList',
          showRecent?.classNames?.list
        ),
        header: cx(
          'ais-AutocompleteRecentSearchesHeader',
          showRecent?.classNames?.header
        ),
        item: cx(
          'ais-AutocompleteRecentSearchesItem',
          showRecent?.classNames?.item
        ),
      };

      const isSearchPage =
        targetIndex
          ?.getWidgets()
          .some(({ $$type }) =>
            ['ais.hits', 'ais.infiniteHits'].includes($$type)
          ) ?? false;

      const onRefine = (query) => {
        setLocalQuery(query);
        refineAutocomplete(query);
        // Before activation there is no isolated index to mirror the query to.
        if (!state.isolatedIndex) {
          return;
        }
        instantSearchInstance.setUiState((uiState) => ({
          ...uiState,
          [targetIndex.getIndexId()]: {
            ...uiState[targetIndex.getIndexId()],
            query,
          },
          [isolatedIndex.getIndexId()]: { query },
        }));
        if (query.length > 0) {
          storage.onAdd(query);
        }
      };

      const slot = (name) => getScopedSlot(this, name);
      const panelSlot = slot('panel');
      const noResultsSlot = slot('noResults');

      const allIndicesEmpty = indicesForPanel.every(
        ({ hits }) => hits.length === 0
      );
      const recentEmpty = !storageHits || storageHits.length === 0;
      const shouldHideEmptyPanel =
        allIndicesEmpty && recentEmpty && !noResultsSlot && !panelSlot;

      const getChatRenderState = () =>
        instantSearchInstance.renderState[targetIndex.getIndexId()]?.chat;

      const defaultOnSelect = ({ query, item, setQuery, url }) => {
        if (isPromptSuggestion(item)) {
          const chatRenderState = getChatRenderState();

          if (chatRenderState) {
            if (
              openChat(chatRenderState, {
                message: item.prompt,
                referer: 'prompt-suggestions-autocomplete',
              })
            ) {
              setQuery('');
            }
            return;
          }

          if (
            process.env.NODE_ENV !== 'production' &&
            promptSuggestionsKey &&
            !state.hasWarnedMissingPromptSuggestionsChat
          ) {
            state.hasWarnedMissingPromptSuggestionsChat = true;
            warn(
              'showPromptSuggestions requires an <ais-chat> in the same index to open chat and send messages.'
            );
          }
        }

        if (url) {
          window.location.href = url;
          return;
        }

        if (!isSearchPage && typeof this.getSearchPageUrl !== 'undefined') {
          const indexUiState =
            instantSearchInstance.getUiState()[targetIndex.getIndexId()];
          window.location.href = this.getSearchPageUrl({
            ...indexUiState,
            query,
          });
          return;
        }

        setQuery(query);
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
        indices: indicesForPropGettersWithPromptSuggestions,
        indicesConfig: indicesConfigForPropGetters,
        onRefine,
        onSelect: this.onSelect ?? defaultOnSelect,
        onApply: (query) => {
          refineAutocomplete(query);
        },
        onSubmit: () => {
          // Close the detached modal when form is submitted
          if (isDetached) {
            setIsModalOpen(false);
          }
        },
        placeholder: this.placeholder,
        isDetached,
        shouldHidePanel: shouldHideEmptyPanel,
        autoFocus: this.autofocus,
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

      // The panel is made of one element per section, keyed like in the other
      // flavors: `recent`, `suggestions`, `promptSuggestions`, then `indexName`.
      const elements = {};

      if (showRecent) {
        const recentItemSlot = slot('recentItem');
        const recentHeaderSlot = slot('recentHeader');

        elements.recent = createElement(ui.Index, {
          HeaderComponent: recentHeaderSlot
            ? ({ items }) => recentHeaderSlot({ items })
            : undefined,
          ItemComponent: ({ item, onSelect, onApply }) => {
            const onRemoveRecentSearch = () => storage.onRemove(item.query);

            if (recentItemSlot) {
              return recentItemSlot({
                item,
                onSelect,
                onApply,
                onRemoveRecentSearch,
              });
            }

            return createElement(
              ui.RecentSearch,
              { item, onSelect, onApply, onRemoveRecentSearch },
              renderConditionalHighlight(createElement, ui.Highlight, {
                item,
                attribute: 'query',
                reverse: true,
              })
            );
          },
          classNames: recentSearchCssClasses,
          items: storageHits,
          getItemProps,
        });
      }

      indicesForPanel.forEach(({ indexId, indexName, hits }) => {
        const currentIndexConfig = find(
          indicesConfig,
          (config) => config.indexName === indexName
        );

        if (!currentIndexConfig) {
          return;
        }

        const { kind } = currentIndexConfig;
        const headerSlot = slot(
          kind === 'querySuggestions'
            ? 'querySuggestionHeader'
            : kind === 'promptSuggestions'
              ? 'promptSuggestionHeader'
              : 'header'
        );
        const itemSlot = slot(
          kind === 'querySuggestions'
            ? 'querySuggestionItem'
            : kind === 'promptSuggestions'
              ? 'promptSuggestionItem'
              : 'item'
        );

        const ItemComponent = ({ item, onSelect, onApply }) => {
          if (itemSlot) {
            return itemSlot({ item, indexName, onSelect, onApply });
          }

          if (kind === 'querySuggestions') {
            return createElement(
              ui.Suggestion,
              { item, onSelect, onApply },
              renderConditionalHighlight(createElement, ui.Highlight, {
                item,
                attribute: 'query',
                reverse: true,
              })
            );
          }

          if (kind === 'promptSuggestions') {
            return createElement(
              ui.PromptSuggestion,
              { item, onSelect },
              renderConditionalHighlight(createElement, ui.Highlight, {
                item,
                attribute: 'prompt',
              })
            );
          }

          return `objectID: ${item.objectID}`;
        };

        let elementId = indexName;
        if (indexName === querySuggestionsKey) {
          elementId = 'suggestions';
        } else if (indexName === promptSuggestionsKey) {
          elementId = 'promptSuggestions';
        }

        elements[elementId] = createElement(ui.Index, {
          key: indexId,
          HeaderComponent: headerSlot
            ? ({ items }) => headerSlot({ items, indexName })
            : undefined,
          ItemComponent,
          NoResultsComponent:
            noResultsSlot && !kind
              ? () => noResultsSlot({ indexName })
              : undefined,
          items: hits.map((item) => ({ ...item, __indexName: indexName })),
          getItemProps,
          sendEvent: find(indices, (idx) => idx.indexId === indexId)?.sendEvent,
          classNames: currentIndexConfig.classNames,
        });
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

      const searchBoxContent = createElement(ui.SearchBox, {
        query: localQuery,
        inputProps: {
          ...inputProps,
          onFocus: (event) => {
            this.activate();
            if (inputProps.onFocus) inputProps.onFocus(event);
          },
          onInput: (event) => {
            const query = event.currentTarget.value;
            setLocalQuery(query);
            refineAutocomplete(query);
          },
        },
        onClear: () => onRefine(''),
        isSearchStalled: instantSearchInstance.status === 'stalled',
        onCancel: () => {
          if (isDetached) {
            handleCancel();
          }
        },
        isDetached,
        submitTitle: isDetached
          ? translations.detachedCancelButtonText
          : undefined,
        onAiModeClick: this.aiMode
          ? () => {
              setIsOpen(false);
              if (isDetached) {
                setIsModalOpen(false);
              }
              if (
                openChat(getChatRenderState(), {
                  message: localQuery,
                  referer: 'ai-mode',
                })
              ) {
                onRefine('');
              }
            }
          : undefined,
        aiModeButtonDisabled: this.aiMode
          ? isChatBusy(getChatRenderState())
          : undefined,
        classNames: cssClasses,
      });

      const panelContent = createElement(
        ui.Panel,
        {
          ...getPanelProps(),
          classNames: {
            root: cssClasses.panel,
            open: cssClasses.panelOpen,
            layout: cssClasses.panelLayout,
          },
        },
        panelSlot
          ? panelSlot({ elements, indices: indicesForPanel })
          : Object.keys(elements).map((elementId) => elements[elementId])
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
        return createElement(
          ui.Autocomplete,
          { ...rootProps, rootRef, classNames: cssClasses },
          createElement(ui.DetachedSearchButton, {
            query: localQuery,
            placeholder: this.placeholder,
            classNames: cssClasses,
            onClick: () => {
              setIsModalOpen(true);
              setIsOpen(true);
            },
            onClear: () => onRefine(''),
            translations,
          }),
          isolatedIndexContent,
          isModalOpen &&
            createElement(
              ui.DetachedOverlay,
              { classNames: cssClasses, onClose: handleCancel },
              createElement(
                ui.DetachedContainer,
                { classNames: detachedContainerCssClasses },
                createElement(
                  ui.DetachedFormContainer,
                  { classNames: cssClasses },
                  searchBoxContent
                ),
                panelContent
              )
            )
        );
      }

      return createElement(
        ui.Autocomplete,
        { ...rootProps, rootRef, classNames: cssClasses },
        searchBoxContent,
        panelContent,
        isolatedIndexContent
      );
    },
  },
  render: renderReactCompat(function (h) {
    const { renderOptions, activated } = this.$_ais;

    if (!renderOptions) {
      return null;
    }

    // Keyed so the subtree isn't remounted when the layout changes (detached).
    const isolatedIndexContent = activated
      ? h(IsolatedIndex, {
          key: 'ais-autocomplete-isolated-index',
          tree: this.$_aisTree,
          handleRender: this.updateRenderOptions,
          handleMount: this.handleConnectorMount,
        })
      : null;

    this.hooksStore.beginRender();

    try {
      return this.renderAutocomplete(h, renderOptions, isolatedIndexContent);
    } finally {
      this.hooksStore.endRender();
    }
  }),
};
