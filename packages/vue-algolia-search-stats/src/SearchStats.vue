<template>
  <div class="alg-search-stats" v-if="nbHits > 0">
    <slot>{{nbHits}} results found in {{processingTimeMS}}ms</slot>
  </div>
</template>

<script>
  import algoliaComponent from 'vue-algolia-component'

  export default {
    mixins: [algoliaComponent],
    computed: {
      nbHits () {
        return this.searchStore.nbHits
      },
      processingTimeMS () {
        return this.searchStore.processingTimeMS
      }
    }
  }
</script>
