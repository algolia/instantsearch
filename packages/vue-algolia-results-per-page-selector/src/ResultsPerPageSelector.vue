<template>
  <select class="alg-hpp-selector"
          @change="onChange"
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
      resultsPerPage: function () {
        return this.searchStore.resultsPerPage
      }
    },
    mounted: function () {
      if (this.options.indexOf(this.searchStore.resultsPerPage) === -1) {
        this.searchStore.resultsPerPage = this.options[0]
      }
    },
    methods: {
      onChange: function (event) {
        this.searchStore.resultsPerPage = Number(event.target.value)
      }
    }
  }
</script>
