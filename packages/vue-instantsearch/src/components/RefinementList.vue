<script>
import { connectRefinementList } from 'instantsearch-core';
import { createRefinementListComponent } from 'instantsearch-ui-components';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

import SearchInput from './SearchInput.vue';

const noop = () => {};

export default {
  name: 'AisRefinementList',
  mixins: [
    createSuitMixin({ name: 'RefinementList' }),
    createWidgetMixin(
      {
        connector: connectRefinementList,
      },
      {
        $$widgetType: 'ais.refinementList',
      }
    ),
    createPanelConsumerMixin(),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    searchable: {
      type: Boolean,
      default: undefined,
    },
    searchablePlaceholder: {
      type: String,
      required: false,
      default: 'Search here…',
    },
    operator: {
      default: 'or',
      validator(value) {
        return value === 'and' || value === 'or';
      },
      required: false,
    },
    limit: {
      type: Number,
      required: false,
      default: undefined,
    },
    showMoreLimit: {
      type: Number,
      required: false,
      default: undefined,
    },
    showMore: {
      type: Boolean,
      required: false,
      default: false,
    },
    showMoreButtonLabel: {
      type: String,
      required: false,
      default: undefined,
    },
    sortBy: {
      type: [Array, Function],
      required: false,
      default: undefined,
    },
    transformItems: {
      type: Function,
      required: false,
      default: undefined,
    },
  },
  data() {
    return {
      searchForFacetValuesQuery: '',
    };
  },
  computed: {
    searchForFacetValues: {
      get() {
        return this.searchForFacetValuesQuery;
      },
      set(value) {
        this.state.searchForItems(value);
        this.searchForFacetValuesQuery = value;
      },
    },
    toggleShowMore() {
      return this.state.toggleShowMore || noop;
    },
    items() {
      return this.state.items.map((item) =>
        Object.assign({}, item, {
          _highlightResult: {
            item: {
              value: item.highlighted,
            },
          },
        })
      );
    },
    widgetParams() {
      return {
        attribute: this.attribute,
        operator: this.operator,
        limit: this.limit,
        showMore: this.showMore,
        showMoreLimit: this.showMoreLimit,
        sortBy: this.sortBy,
        transformItems: this.transformItems,
      };
    },
  },
  methods: {
    refine(value) {
      this.state.refine(value);
      this.searchForFacetValuesQuery = '';
    },
  },
  render: renderReactCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const defaultSlot = getScopedSlot(this, 'default');
    if (defaultSlot) {
      return h(
        'div',
        {
          className: [
            this.suit(),
            this.items.length === 0 && this.suit('', 'noRefinement'),
          ],
        },
        [
          defaultSlot({
            items: this.items,
            refine: this.refine,
            searchForItems: this.state.searchForItems,
            searchForItemsQuery: this.searchForFacetValuesQuery,
            toggleShowMore: this.toggleShowMore,
            canToggleShowMore: this.state.canToggleShowMore,
            isShowingMore: this.state.isShowingMore,
            createURL: this.state.createURL,
            isFromSearch: this.state.isFromSearch,
            canRefine: this.state.canRefine,
            sendEvent: this.state.sendEvent,
          }),
        ]
      );
    }

    const itemSlot = getScopedSlot(this, 'item');
    const noResultsSlot = getScopedSlot(this, 'noResults');
    const showMoreLabelSlot = getScopedSlot(this, 'showMoreLabel');

    const RefinementList = createRefinementListComponent({
      createElement: h,
      Fragment,
    });

    return h(RefinementList, {
      items: this.items,
      onRefine: (item) => this.refine(item.value),
      isFromSearch: this.state.isFromSearch,
      searchBoxComponent: this.searchable
        ? () =>
            h(
              'div',
              { className: 'ais-SearchBox' },
              h(SearchInput, {
                modelValue: this.searchForFacetValues,
                onInput: (value) => {
                  this.searchForFacetValues = value;
                },
                showLoadingIndicator: true,
                placeholder: this.searchablePlaceholder,
                submitTitle: 'Submit the search query',
                resetTitle: 'Clear the search query',
                classNames: this.classNames,
              })
            )
        : undefined,
      showNoResults: Boolean(
        this.searchable && this.state.isFromSearch && this.items.length === 0
      ),
      noResultsComponent:
        noResultsSlot &&
        (() => noResultsSlot({ query: this.searchForFacetValues })),
      itemComponent:
        itemSlot &&
        (({ item, className }) =>
          h(
            'li',
            { className, key: item.value },
            itemSlot({
              item,
              refine: this.refine,
              createURL: this.state.createURL,
            })
          )),
      showMore: this.showMore,
      canToggleShowMore: this.state.canToggleShowMore,
      isShowingMore: this.state.isShowingMore,
      onToggleShowMore: this.toggleShowMore,
      showMoreTextComponent: showMoreLabelSlot,
      translations: { showMoreButtonLabel: this.showMoreButtonLabel },
      classNames: this.classNames && {
        root: this.classNames['ais-RefinementList'],
        noRefinementRoot: this.classNames['ais-RefinementList--noRefinement'],
        searchBox: this.classNames['ais-RefinementList-searchBox'],
        noResults: this.classNames['ais-RefinementList-noResults'],
        list: this.classNames['ais-RefinementList-list'],
        item: this.classNames['ais-RefinementList-item'],
        selectedItem: this.classNames['ais-RefinementList-item--selected'],
        label: this.classNames['ais-RefinementList-label'],
        checkbox: this.classNames['ais-RefinementList-checkbox'],
        labelText: this.classNames['ais-RefinementList-labelText'],
        count: this.classNames['ais-RefinementList-count'],
        showMore: this.classNames['ais-RefinementList-showMore'],
        disabledShowMore:
          this.classNames['ais-RefinementList-showMore--disabled'],
      },
    });
  }),
};
</script>
