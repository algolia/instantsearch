<template>
  <div :class="bem()" v-if="show">

    <slot name="header"></slot>

    <slot v-for="(result, index) in results" :result="result" :index="index">
      Result 'objectID': {{ result.objectID }}
    </slot>

    <slot name="footer"></slot>

  </div>
</template>

<script>
import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  props: {
    stack: {
      type: Boolean,
      default: false,
    },
    resultsPerPage: {
      type: Number,
    },
  },
  data() {
    return {
      blockClassName: 'ais-results',
    };
  },
  created() {
    this.updateResultsPerPage();
  },
  watch: {
    resultsPerPage() {
      this.updateResultsPerPage();
    },
  },
  methods: {
    updateResultsPerPage() {
      if (typeof this.resultsPerPage === 'number' && this.resultsPerPage > 0) {
        this.searchStore.resultsPerPage = this.resultsPerPage;
      }
    },
  },
  computed: {
    results() {
      if (this.stack === false) {
        return this.searchStore.results;
      }

      if (typeof this.stackedResults === 'undefined') {
        this.stackedResults = [];
      }

      if (this.searchStore.page === 1) {
        this.stackedResults = [];
      }

      if (
        this.stackedResults.length === 0 ||
        this.searchStore.results.length === 0
      ) {
        this.stackedResults.push(...this.searchStore.results);
      } else {
        const lastStacked = this.stackedResults[this.stackedResults.length - 1];
        const lastResult = this.searchStore.results[
          this.searchStore.results.length - 1
        ];

        if (lastStacked.objectID !== lastResult.objectID) {
          this.stackedResults.push(...this.searchStore.results);
        }
      }

      return this.stackedResults;
    },
    show() {
      return this.results.length > 0;
    },
  },
};
</script>
