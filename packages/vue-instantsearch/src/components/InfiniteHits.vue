<template>
  <div :class="suit()" v-if="state">
    <slot :items="items" :isLastPage="isLastPage" :refine="refine">
      <ol :class="suit('list')">
        <li
          v-for="(item, index) in items"
          :class="suit('item')"
          :key="item.objectID"
        >
          <slot name="item" :item="item" :index="index">
            objectID: {{item.objectID}}, index: {{index}}
          </slot>
        </li>
      </ol>

      <button
        :class="[suit('loadMore'), isLastPage && suit('loadMore', 'disabled')]"
        :disabled="isLastPage"
        @click="refine"
      >
        Show more results
      </button>
    </slot>
  </div>
</template>

<script>
import algoliaComponent from '../component';
import { connectInfiniteHits } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
  data() {
    return {
      widgetName: 'InfiniteHits',
    };
  },
  beforeCreate() {
    this.connector = connectInfiniteHits;
  },
  computed: {
    items() {
      // Fixes InstantSearch.js connectors API: every list
      // of things must be called `items`
      return this.state.hits;
    },
    isLastPage() {
      return this.state.isLastPage;
    },
  },
  methods: {
    refine() {
      // Fixes InstantSearch.js connectors API: every function
      // that trigger a search must be called `refine`
      this.state.showMore();
    },
  },
};</script>
