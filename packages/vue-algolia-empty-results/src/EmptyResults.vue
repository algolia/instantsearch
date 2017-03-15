<template>
  <div class="empty-search-results" v-if="nbHits <= 0">
    <slot :query="query">
      No results matched your query <strong class="alg-empty-results__query">{{query}}</strong>
    </slot>
  </div>
</template>

<script>
  import algoliaComponent from 'vue-algolia-component'

  export default {
    mixins: [algoliaComponent],
    computed: {
      nbHits: function () {
        return this.searchStore.nbHits
      },
      query: function () {
        return this.searchStore.query
      }
    }
  }
</script>
