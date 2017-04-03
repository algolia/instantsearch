<template>
  <div class="ais-stats" v-if="totalResults > 0">
    <slot>{{totalResults}} results found in {{processingTimeMS}}ms</slot>
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
      processingTimeMS () {
        return this.searchStore.processingTimeMS
      }
    }
  }
</script>
