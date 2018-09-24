<template>
  <div
    :class="[
      suit(),
      !state.canRefine && suit('','noRefinement')
    ]"
    v-if="state"
  >
    <slot
      :items="items"
      :refine="refine"
      :search-for-items="state.searchForItems"
      :toggle-show-more="toggleShowMore"
      :is-showing-more="state.isShowingMore"
      :createURL="state.createURL"
      :is-from-search="state.isFromSearch"
      :can-refine="state.canRefine"
    >
      <div
        :class="suit('searchBox')"
        v-if="searchable"
      >
        <ais-search-input v-model="searchForFacetValues" />
      </div>
      <slot
        name="noResults"
        :query="searchForFacetValues"
        v-if="state.isFromSearch && items.length === 0"
      >
        <div :class="suit('noResults')">No results.</div>
      </slot>
      <ul :class="suit('list')">
        <li
          :class="[
          suit('item'), item.isRefined && suit('item', 'selected')]"
          v-for="item in items"
          :key="item.value"
        >
          <slot
            name="item"
            :item="item"
            :refine="refine"
          >
            <label :class="suit('label')">
              <input
                :class="suit('checkbox')"
                type="checkbox"
                :value="item.value"
                :checked="item.isRefined"
                @change="refine(item.value)"
              >
              <span
                v-if="searchable"
                :class="suit('labelText')"
              >
                <ais-highlight
                  attribute="item"
                  :hit="item"
                />
              </span>
              <span
                v-else
                :class="suit('labelText')"
              >{{ item.label }}</span>
              <span :class="suit('count')">{{ item.count }}</span>
            </label>
          </slot>
        </li>
      </ul>
      <button
        :class="[
          suit('showMore'),
          {
            [suit('showMore', 'disabled')]: !state.canToggleShowMore,
          }
        ]"
        @click="toggleShowMore"
        v-if="showMore"
        :disabled="!state.canToggleShowMore"
      >
        <slot
          name="showMoreLabel"
          :is-showing-more="state.isShowingMore"
        >
          Show {{ state.isShowingMore ? 'less' : 'more' }}
        </slot>
      </button>
    </slot>
  </div>
</template>

<script>
import { createWidgetMixin } from '../mixins/widget';
import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { connectRefinementList } from 'instantsearch.js/es/connectors';
import AisSearchInput from './SearchInput.vue';
import AisHighlight from './Highlight.vue';

const noop = () => {};

export default {
  components: { AisSearchInput, AisHighlight },
  mixins: [
    createSuitMixin({ name: 'RefinementList' }),
    createWidgetMixin({ connector: connectRefinementList }),
    createPanelConsumerMixin({
      mapStateToCanRefine: state => state.canRefine,
    }),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    searchable: {
      type: Boolean,
      default: false,
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
      default: 10,
      required: false,
    },
    showMoreLimit: {
      type: Number,
      default: 20,
      required: false,
    },
    showMore: {
      type: Boolean,
      default: false,
      required: false,
    },
    sortBy: {
      type: [Array, Function],
      default: () => ['isRefined', 'count:desc', 'name:asc'],
      required: false,
    },
    transformItems: {
      type: Function,
      default: items => items,
      required: false,
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
      return this.state.items.map(item =>
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
        attributeName: this.attribute,
        operator: this.operator,
        limit: this.limit,
        showMoreLimit: this.showMore ? this.showMoreLimit : undefined,
        sortBy: this.sortBy,
        escapeFacetValues: true,
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
};
</script>
