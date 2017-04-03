<template>
  <select class="alg-sort-by-selector"
          v-model="indexName"
          :name="name"
  >
    <slot v-for="index in indices" :indexName="indexName">
      <option :value="index.name">
        {{ index.label }}
      </option>
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
        default: "index_name"
      },
      indices: {
        type: Array,
        required: true
      }
    },
    computed: {
      indexName: {
        get () {
          return this.searchStore.indexName
        },
        set (value) {
          this.searchStore.indexName = value
        }
      }
    },
    mounted: function () {
      let match = false
      for (let index in this.indices) {
        if (this.indices[index].name === this.indexName) {
          match = true
        }
      }

      if (!match) {
        this.indexName = this.indices[0].name
      }
    }
  }
</script>

