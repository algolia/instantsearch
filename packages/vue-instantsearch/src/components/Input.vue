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
      widget: undefined,
      state: {},
    };
  },
  created() {
    this.widget = connectSearchBox(this.updateData);

    this._instance.addWidget(this.widget());
  },
  beforeDestroy() {
    this._instance.removeWidget(this.widget);
  },
  methods: {
    updateData(state = {}, isFirstRendering) {
      this.state = state;
    },
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
  },
};
</script>
