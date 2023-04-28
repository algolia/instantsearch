<template>
  <div v-if="state" :class="suit()">
    <slot
      v-if="showPrevious"
      name="loadPrevious"
      :refine-previous="refinePrevious"
      :page="state.results.page"
      :is-first-page="state.isFirstPage"
    >
      <button
        :class="[
          suit('loadPrevious'),
          state.isFirstPage && suit('loadPrevious', 'disabled'),
        ]"
        :disabled="state.isFirstPage"
        @click="refinePrevious()"
      >
        Show previous results
      </button>
    </slot>

    <slot
      :items="items"
      :results="state.results"
      :is-last-page="state.isLastPage"
      :refine-previous="refinePrevious"
      :refine-next="refineNext"
      :refine="refineNext"
      :insights="state.insights"
      :send-event="state.sendEvent"
    >
      <ol :class="suit('list')">
        <li
          v-for="(item, index) in items"
          :class="suit('item')"
          :key="item.objectID"
          @click="state.sendEvent('click:internal', item, 'Hit Clicked')"
        >
          <slot
            name="item"
            :item="item"
            :index="index"
            :insights="state.insights"
            :send-event="state.sendEvent"
          >
            objectID: {{ item.objectID }}, index: {{ index }}
          </slot>
        </li>
      </ol>

      <slot
        name="loadMore"
        :refine-next="refineNext"
        :refine="refineNext"
        :page="state.results.page"
        :is-last-page="state.isLastPage"
      >
        <button
          :class="[
            suit('loadMore'),
            state.isLastPage && suit('loadMore', 'disabled'),
          ]"
          :disabled="state.isLastPage"
          @click="refineNext()"
        >
          Show more results
        </button>
      </slot>
    </slot>
  </div>
</template>

<script>
import { createWidgetMixin } from '../mixins/widget';
import { connectInfiniteHitsWithInsights } from 'instantsearch.js/es/connectors';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisInfiniteHits',
  mixins: [
    createWidgetMixin(
      {
        connector: connectInfiniteHitsWithInsights,
      },
      {
        $$widgetType: 'ais.infiniteHits',
      }
    ),
    createSuitMixin({ name: 'InfiniteHits' }),
  ],
  props: {
    showPrevious: {
      type: Boolean,
      default: false,
    },
    escapeHTML: {
      type: Boolean,
      default: true,
    },
    transformItems: {
      type: Function,
      default: undefined,
    },
    cache: {
      type: Object,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        showPrevious: this.showPrevious,
        escapeHTML: this.escapeHTML,
        transformItems: this.transformItems,
        cache: this.cache,
      };
    },
    items() {
      // Fixes InstantSearch.js connectors API: every list
      // of things must be called `items`
      return this.state.hits;
    },
  },
  methods: {
    refinePrevious() {
      this.state.showPrevious();
    },
    refineNext() {
      this.state.showMore();
    },
  },
};
</script>
