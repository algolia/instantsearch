import {
  createAutocompleteComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompletePropGetters,
  createAutocompleteSearchComponent,
  createAutocompleteSuggestionComponent,
} from 'instantsearch-ui-components';
import {
  connectAutocomplete,
  connectSearchBox,
} from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { createHooksStore } from '../util/hooks';
import {
  Fragment,
  isVue3,
  renderCompat,
  renderReactCompat,
} from '../util/vue-compat';

import AisConfigure from './Configure';
import AisIndex from './Index';

let autocompleteInstanceId = 0;

/**
 * Phase 1 of the Autocomplete port: `indices` + `showQuerySuggestions` in
 * normal (non-detached) mode. Detached mode, feeds, recent-search storage,
 * prompt suggestions and AI mode are follow-ups.
 *
 * The connector reads results from `scopedResults`, so the widget must render
 * an isolated `<AisIndex>` subtree (with a `<AisConfigure>` per source). The
 * inner component reads those results via `connectAutocomplete`.
 */

// Inner component: registered under the isolated index scope, reads the
// autocomplete connector render state and renders the shared UI.
const AisAutocompleteInner = {
  name: 'AisAutocompleteInner',
  mixins: [
    createWidgetMixin(
      { connector: connectAutocomplete },
      { $$type: 'ais.autocomplete', $$widgetType: 'ais.autocomplete' }
    ),
  ],
  props: {
    indicesConfig: { type: Array, required: true },
    refineSearchBox: { type: Function, required: true },
    placeholder: { type: String, default: undefined },
    autofocus: { type: Boolean, default: false },
    classNames: { type: Object, default: undefined },
    domId: { type: String, required: true },
    transformItems: { type: Function, default: undefined },
  },
  created() {
    this.hooksStore = createHooksStore(() => this.$forceUpdate());
    this.usePropGetters = createAutocompletePropGetters(this.hooksStore.hooks);
  },
  mounted() {
    this.hooksStore.flushEffects();
  },
  updated() {
    this.hooksStore.flushEffects();
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    this.hooksStore.cleanup();
  },
  computed: {
    widgetParams() {
      return {
        transformItems: this.transformItems,
        future: { undefinedEmptyQuery: true },
      };
    },
  },
  render: renderReactCompat(function (h) {
    // Render the search box + panel shell immediately; results fill in once the
    // isolated indices resolve. Waiting for `this.state` leaves the widget
    // invisible until the first results (and on Vue 3 the connector's first
    // render is skipped, so it would never appear).
    const AutocompleteUiComponent = createAutocompleteComponent({
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
    const AutocompleteSearchUi = createAutocompleteSearchComponent({
      createElement: h,
      Fragment,
    });
    const DefaultSuggestion = createAutocompleteSuggestionComponent({
      createElement: h,
      Fragment,
    });

    const indices = (this.state && this.state.indices) || [];
    const refineAutocomplete = (this.state && this.state.refine) || (() => {});
    const currentRefinement =
      (this.state && this.state.currentRefinement) || '';
    const indicesConfig = this.indicesConfig;
    const { refineSearchBox } = this;

    this.hooksStore.beginRender();

    const { getInputProps, getItemProps, getPanelProps, getRootProps } =
      this.usePropGetters({
        indices,
        indicesConfig,
        onRefine: (query) => refineAutocomplete(query),
        onSelect: ({ setQuery }) => {
          // Default onSelect fills the query with the selected item.
          if (setQuery) {
            /* handled per-config getQuery via prop getters */
          }
        },
        onApply: (query) => {
          refineAutocomplete(query);
        },
        placeholder: this.placeholder,
        autoFocus: this.autofocus,
        id: this.domId,
      });

    const resolvedQuery = currentRefinement;

    // Search box
    const inputProps = getInputProps();
    const searchBoxContent = h(AutocompleteSearchUi, {
      inputProps: Object.assign({}, inputProps, {
        onChange: (event) => refineAutocomplete(event.currentTarget.value),
      }),
      onClear: () => {
        refineSearchBox('');
        refineAutocomplete('');
      },
      query: resolvedQuery,
      isSearchStalled: false,
      classNames: this.classNames,
    });

    // Panel: one AutocompleteIndex per results index.
    const elements = indices.map((index) => {
      const config = indicesConfig.find(
        (cfg) => cfg.indexName === index.indexName
      );
      if (!config) {
        return null;
      }
      const ItemComponent =
        config.itemComponent ||
        (config.isQuerySuggestions
          ? (itemProps) => h(DefaultSuggestion, itemProps)
          : undefined);
      return h(AutocompleteIndex, {
        key: index.indexId,
        HeaderComponent: config.headerComponent,
        ItemComponent,
        NoResultsComponent: config.noResultsComponent,
        items: index.hits.map((item) =>
          Object.assign({}, item, { __indexName: index.indexName })
        ),
        getItemProps,
        sendEvent: index.sendEvent,
        classNames: config.classNames,
      });
    });

    const panelContent = h(
      AutocompletePanel,
      Object.assign({}, getPanelProps(), {
        classNames: {
          root: this.classNames && this.classNames.panel,
          open: this.classNames && this.classNames.panelOpen,
          layout: this.classNames && this.classNames.panelLayout,
        },
      }),
      elements
    );

    const { ref: rootRef, ...rootProps } = getRootProps();

    const tree = h(
      AutocompleteUiComponent,
      Object.assign({}, rootProps, {
        rootRef,
        classNames: this.classNames,
      }),
      searchBoxContent,
      panelContent
    );

    this.hooksStore.endRender();

    return tree;
  }),
};

export default {
  name: 'AisAutocomplete',
  mixins: [
    createWidgetMixin(
      { connector: connectSearchBox },
      { $$type: 'ais.autocomplete', $$widgetType: 'ais.autocomplete' }
    ),
    createSuitMixin({ name: 'Autocomplete' }),
  ],
  props: {
    indices: { type: Array, required: false, default: () => [] },
    showQuerySuggestions: {
      type: Object,
      required: false,
      default: undefined,
    },
    searchParameters: { type: Object, required: false, default: undefined },
    requiresSearch: { type: Boolean, required: false, default: true },
    autofocus: { type: Boolean, required: false, default: false },
    placeholder: { type: String, required: false, default: undefined },
    transformItems: { type: Function, required: false, default: undefined },
  },
  created() {
    this.instanceKey = `ais-autocomplete-${(autocompleteInstanceId += 1)}`;
  },
  mounted() {
    this.bootstrapIsolatedSearch();
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    this._isUnmounted = true;
  },
  methods: {
    // Bootstrap the isolated index's search. Like the JS widget
    // (autocomplete.tsx), setting the query on the isolated tree's helper is
    // what triggers its first search — the isolated index doesn't search on
    // init by itself. The isolated index's derived helper is created during
    // its `init` (after mount, in the search cycle), so retry a few ticks.
    bootstrapIsolatedSearch(attempt = 0) {
      const indexWidget =
        this.$refs.isolatedIndex && this.$refs.isolatedIndex.widget;
      const helper =
        indexWidget && indexWidget.getHelper && indexWidget.getHelper();

      if (helper) {
        if (this.instantSearchInstance.scheduleSearch) {
          this.instantSearchInstance.scheduleSearch.cancel();
        }
        const parentQuery = (this.state && this.state.query) || '';
        helper.setQuery(parentQuery).search();
        return;
      }

      if (attempt < 10 && !this._isUnmounted) {
        setTimeout(() => this.bootstrapIsolatedSearch(attempt + 1), 0);
      }
    },
  },
  computed: {
    // The searchbox companion drives the parent index query; `dependsOn`
    // controls whether the main search is required.
    widgetParams() {
      return {};
    },
    // Stable (cached) attrs for the root `<AisConfigure>`. A fresh object each
    // render would change `AisConfigure`'s `$attrs`, re-run its `widgetParams`
    // computed and re-register the connector every render — an infinite loop
    // under Vue 3's deep watcher.
    rootConfigureAttrs() {
      return Object.assign({ hitsPerPage: 5 }, this.searchParameters);
    },
    indicesConfig() {
      const config = this.indices.map((index) =>
        Object.assign({}, index, {
          itemComponent: index.itemComponent,
          configureAttrs: Object.assign(
            { hitsPerPage: 5 },
            index.searchParameters
          ),
        })
      );
      if (this.showQuerySuggestions) {
        config.push({
          indexName: this.showQuerySuggestions.indexName,
          getQuery: (item) => item.query,
          // A default suggestion item component is built in the inner render
          // (where the Vue `createElement` is available) when omitted.
          itemComponent: this.showQuerySuggestions.itemComponent,
          isQuerySuggestions: true,
          configureAttrs: Object.assign(
            { hitsPerPage: 5 },
            this.showQuerySuggestions.searchParameters
          ),
        });
      }
      return config;
    },
  },
  render: renderCompat(function (h) {
    const refineSearchBox = (this.state && this.state.refine) || (() => {});

    const rootIndexId = this.instanceKey;
    // `<AisConfigure>` reads its search parameters from `$attrs`; pass the
    // (stable) params as attrs, not a prop.
    const children = [
      h(AisConfigure, {
        key: 'configure',
        attrs: this.rootConfigureAttrs,
      }),
    ];

    // A child index per configured source (indices + query suggestions).
    this.indicesConfig.forEach((config) => {
      children.push(
        h(
          AisIndex,
          {
            key: config.indexName,
            props: {
              indexName: config.indexName,
              indexId: `${rootIndexId}-${config.indexName}`,
            },
          },
          [
            h(AisConfigure, {
              key: 'configure',
              attrs: config.configureAttrs,
            }),
          ]
        )
      );
    });

    children.push(
      h(AisAutocompleteInner, {
        key: 'inner',
        props: {
          indicesConfig: this.indicesConfig,
          refineSearchBox,
          placeholder: this.placeholder,
          autofocus: this.autofocus,
          classNames: this.classNames,
          domId: rootIndexId,
          transformItems: this.transformItems,
        },
      })
    );

    return h(
      AisIndex,
      {
        ref: 'isolatedIndex',
        props: { isolated: true, indexId: rootIndexId },
      },
      children
    );
  }),
};
