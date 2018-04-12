<template>
  <div :class="suit()" v-if="totalResults > 0">
    <slot :totalResults="totalResults" :processingTime="processingTime" :query="query">
      {{ totalResults.toLocaleString() }} results found in {{ processingTime.toLocaleString() }}ms
    </slot>
  </div>
</template>

<script>
import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  data() {
    return {
      widgetName: 'ais-stats',
    };
  },
  computed: {
    query() {
      return this.searchStore.query;
    },
    totalResults() {
      return this.searchStore.totalResults;
    },
    processingTime() {
      return this.searchStore.processingTimeMS;
    },
  },
};</script>
