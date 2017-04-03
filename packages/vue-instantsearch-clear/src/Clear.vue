<template>
  <button type="reset"
          class="alg-clear-search"
          :class="{'alg-clear-search--disabled': disabled}"
          :disabled="disabled"
          @click.prevent="clear"
  >
    <slot>
      <span class="alg-clear-search__label">Clear</span>
    </slot>
  </button>
</template>

<script>
  import algoliaComponent from 'vue-instantsearch-component'

  export default {
    mixins: [algoliaComponent],
    props: {
      clearQuery: {
        type: Boolean,
        required: false,
        default: true
      },
      clearFacets: {
        type: Boolean,
        required: false,
        default: true
      }
    },
    computed: {
      disabled: function () {
        if (this.clearQuery && this.searchStore.query.length > 0) {
          return false
        }

        if (this.clearFacets && this.searchStore.activeRefinements.length > 0) {
          return false
        }

        return true
      }
    },
    methods: {
      clear: function () {
        this.searchStore.stop()
        if (this.clearQuery && this.searchStore.query.length > 0) {
          this.searchStore.query = ''
        }

        if (this.clearFacets && this.searchStore.activeRefinements.length > 0) {
          this.searchStore.clearRefinements()
        }
        this.searchStore.start()
      }
    }
  }
</script>

