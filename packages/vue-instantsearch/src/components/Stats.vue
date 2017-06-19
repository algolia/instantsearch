<template>
  <div :class="bem()" v-if="totalResults > 0">
    <slot :totalResults="totalResults" :processingTime="processingTime" :query="query">
      {{ totalResults }} results found in {{ processingTime }}ms
    </slot>
  </div>
</template>

<script>import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  data() {
    return {
      blockClassName: 'ais-stats',
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
};
</script>
