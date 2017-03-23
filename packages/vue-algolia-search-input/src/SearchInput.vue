<template>
  <input type="search"
         autocorrect="off"
         autocapitalize="off"
         autocomplete="off"
         spellcheck="false"
         class="alg-search-input"
         v-model="query"
         :name="name"
  >
</template>

<script>
  import algoliaComponent from 'vue-algolia-component'

  export default {
    mixins: [algoliaComponent],
    props: {
      name: {
        type: String,
        default: "query"
      }
    },
    computed: {
      query: {
        get () {
          return this.searchStore.query
        },
        set (value) {
          this.searchStore.stop()
          this.searchStore.query = value
          this.$emit('query', value)

          // We here ensure we give the time to listeners to alter the store's state
          // without triggering in between ghost queries.
          this.$nextTick(function () {
            this.searchStore.start()
          })
        }
      }
    }
  }
</script>
