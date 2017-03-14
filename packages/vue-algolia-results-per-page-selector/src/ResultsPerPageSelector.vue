<template>
  <select class="alg-hpp-selector"
          @change="onChange"
          v-model="hitsPerPage"
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
        default: 'hits_per_page'
      },
      options: {
        type: Array,
        default: function () {
          return [6, 12, 24]
        }
      },
    },
    computed: {
      hitsPerPage: function () {
        return this.searchStore.hitsPerPage
      }
    },
    mounted: function () {
      if (this.options.indexOf(this.searchStore.hitsPerPage) === -1) {
        this.searchStore.hitsPerPage = this.options[0]
      }
    },
    methods: {
      onChange: function (event) {
        this.searchStore.hitsPerPage = Number(event.target.value)
      }
    }
  }
</script>
