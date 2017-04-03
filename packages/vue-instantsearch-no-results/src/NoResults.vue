<template>
  <div class="alg-no-results" v-if="totalResults <= 0">
    <slot :query="query">
      No results matched your query <strong class="alg-no-results__query">{{query}}</strong>
    </slot>
  </div>
</template>

<script>
  import algoliaComponent from 'vue-instantsearch-component'

  export default {
    mixins: [algoliaComponent],
    computed: {
      totalResults () {
        return this.searchStore.totalResults
      },
      query () {
        return this.searchStore.query
      }
    }
  }
</script>
