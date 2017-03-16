<template>
  <div class="alg-search-results">
    <slot v-for="result in results" :result="result">
      Result 'objectID': {{ result.objectID }}
    </slot>
  </div>
</template>

<script>
  import algoliaComponent from 'vue-algolia-component'

  export default {
    mixins: [algoliaComponent],
    props: {
      stack: {
        type: Boolean,
        default: false
      },
      resultsPerPage: {
        type: Number
      }
    },
    mounted () {
      this.updateResultsPerPage()
    },
    watch: {
      resultsPerPage () {
        this.updateResultsPerPage()
      }
    },
    methods: {
      updateResultsPerPage () {
        if (typeof this.resultsPerPage === 'number' && this.resultsPerPage > 0) {
          this.searchStore.resultsPerPage = this.resultsPerPage
        }
      }
    },
    computed: {
      results () {
        if (this.stack === false) {
          return this.searchStore.results
        }

        if (typeof this.stackedResults === 'undefined') {
          this.stackedResults = []
        }

        if (this.searchStore.page === 0) {
          this.stackedResults = []
        }

        if (this.stackedResults.length === 0 || this.searchStore.results.length === 0) {
          this.stackedResults.push(...this.searchStore.results)
        } else {
          const lastStacked = this.stackedResults[this.stackedResults.length - 1]
          const lastResult = this.searchStore.results[this.searchStore.results.length - 1]

          if (lastStacked['objectID'] !== lastResult['objectID']) {
            this.stackedResults.push(...this.searchStore.results)
          }
        }

        return this.stackedResults
      }
    }
  }
</script>
