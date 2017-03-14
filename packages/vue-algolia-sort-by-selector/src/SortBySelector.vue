<template>
  <select class="alg-sort-by-selector"
          @change="changeIndex"
          v-model="indexName"
          :name="name"
  >
    <slot v-for="index in indices" :index="index">
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
        default: "index"
      },
      indices: {
        type: Array,
        required: true
      }
    },
    computed: {
      indexName: function () {
        return this.searchStore.index
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
        this.searchStore.index = this.indices[0].name
      }
    },
    methods: {
      changeIndex: function (event) {
        this.searchStore.index = event.target.value
      }
    }
  }
</script>

