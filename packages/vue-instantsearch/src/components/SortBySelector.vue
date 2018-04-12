<template>
  <select :class="suit()" v-model="indexName">
    <slot v-for="index in indices" :indexName="index.name" :label="index.label">
      <option :value="index.name" :key="index.name">
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
      widgetName: 'ais-sort-by-selector',
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
  created() {
    let match = false;
    for (const index in this.indices) {
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
