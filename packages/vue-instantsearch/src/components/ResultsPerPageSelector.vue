<template>
  <select :class="suit()" v-model="resultsPerPage">
    <template v-for="option in options">
      <option :value="option" :key="option"><slot :option="option">{{ option }}</slot></option>
    </template>
  </select>
</template>

<script>
import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  props: {
    options: {
      type: Array,
      default() {
        return [6, 12, 24];
      },
    },
  },
  data() {
    return {
      widgetName: 'ais-results-per-page-selector',
    };
  },
  computed: {
    resultsPerPage: {
      get() {
        return this.searchStore.resultsPerPage;
      },
      set(value) {
        this.searchStore.resultsPerPage = Number(value);
      },
    },
  },
  created() {
    if (this.options.indexOf(this.searchStore.resultsPerPage) === -1) {
      this.searchStore.resultsPerPage = this.options[0];
    }
  },
};
</script>
