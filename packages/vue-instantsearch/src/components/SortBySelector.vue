<template>
  <select :class="bem()" v-model="indexName">
    <slot v-for="index in indices" :indexName="indexName">
      <option :value="index.name">
        {{ index.label }}
      </option>
    </slot>
  </select>
</template>

<script>
import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  props: {
    indices: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      blockClassName: 'ais-sort-by-selector',
    };
  },
  computed: {
    indexName: {
      get() {
        return this.searchStore.indexName;
      },
      set(value) {
        this.searchStore.indexName = value;
      },
    },
  },
  mounted: function() {
    let match = false;
    for (let index in this.indices) {
      if (this.indices[index].name === this.indexName) {
        match = true;
      }
    }

    if (!match) {
      this.indexName = this.indices[0].name;
    }
  },
};
</script>
