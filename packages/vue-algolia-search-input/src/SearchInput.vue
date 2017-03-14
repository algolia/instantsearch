<template>
  <input type="search"
         autocorrect="off"
         autocapitalize="off"
         autocomplete="off"
         spellcheck="false"
         class="alg-search-input"

         @input="onInput"
         @change="onInput"

         :value="query"
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
      query () {
        return this.searchStore.query
      }
    },
    methods: {
      onInput (e) {
        this.searchStore.stop()
        this.searchStore.query = e.target.value
        this.$emit('query', e.target.value)

        // We here ensure we give the time to listeners to alter the store's state
        // without triggering in between ghost queries.
        this.$nextTick(function () {
          this.searchStore.start()
        })

      }
    }
  }
</script>
