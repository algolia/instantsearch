<template>
  <div :class="bem()" v-if="totalResults > 0">
    <slot>{{ totalResults }} results found in {{ processingTimeMS }}ms</slot>
  </div>
</template>

<script>
import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  data() {
    return {
      blockClassName: 'ais-stats',
    };
  },
  computed: {
    totalResults() {
      return this.searchStore.totalResults;
    },
    processingTimeMS() {
      return this.searchStore.processingTimeMS;
    },
  },
};
</script>
