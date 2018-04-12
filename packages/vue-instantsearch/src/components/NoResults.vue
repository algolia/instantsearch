<template>
  <div :class="bem()" v-if="totalResults <= 0">
    <slot :query="query">
      No results matched your query <strong :class="bem('query')">{{query}}</strong>
    </slot>
  </div>
</template>

<script>
import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  data() {
    return {
      widgetName: 'ais-no-results',
    };
  },
  computed: {
    totalResults() {
      return this.searchStore.totalResults;
    },
    query() {
      return this.searchStore.query;
    },
  },
};</script>
