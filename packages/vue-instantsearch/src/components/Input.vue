<template>
  <input type="search"
         autocorrect="off"
         autocapitalize="off"
         autocomplete="off"
         spellcheck="false"
         :class="bem()"
         v-model="query"
  >
</template>

<script>
import algoliaComponent from '../component';
import { connectSearchBox } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
  data() {
    return {
      blockClassName: 'ais-input',
    };
  },
  beforeCreate() {
    this.connector = connectSearchBox;
  },
  computed: {
    query: {
      get() {
        return this.state.query;
      },
      set(value) {
        this.state.refine(value);
      },
    },
    widgetParams() {
      return {};
    },
  },
};
</script>
