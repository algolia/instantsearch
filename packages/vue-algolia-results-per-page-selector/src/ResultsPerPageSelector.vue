<template>
  <select class="alg-hpp-selector"
          v-model="resultsPerPage"
          :name="name"
  >
    <slot v-for="option in options" :option="option">
      <option>{{ option }}</option>
    </slot>
  </select>
</template>

<script>
  import algoliaComponent from 'vue-algolia-component'

  export default {
    mixins: [algoliaComponent],
    props: {
      name: {
        type: String,
        default: 'results_per_page'
      },
      options: {
        type: Array,
        default: function () {
          return [6, 12, 24]
        }
      },
    },
    computed: {
      resultsPerPage:{
        get () {
          return this.searchStore.resultsPerPage
        },
        set (value) {
          this.searchStore.resultsPerPage = Number(value)
        }
      }
    },
    mounted: function () {
      if (this.options.indexOf(this.searchStore.resultsPerPage) === -1) {
        this.searchStore.resultsPerPage = this.options[0]
      }
    }
  }
</script>
