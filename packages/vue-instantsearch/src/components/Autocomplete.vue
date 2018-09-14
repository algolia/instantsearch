<template>
  <div
    :class="suit()"
    v-if="state"
  >
    <slot
      :refine="state.refine"
      :current-refinement="state.currentRefinement"
      :indices="state.indices"
    >
      <p>This widget doesn't render anything without a filled in default slot.</p>
      <p>query, function to refine and results are provided.</p>
      <pre>refine: Function</pre>
      <pre>currentRefinement: "{{ state.currentRefinement }}"</pre>
      <details>
        <summary><code>indices</code>:</summary>
        <pre>{{ state.indices }}</pre>
      </details>
    </slot>
  </div>
</template>

<script>
import algoliaComponent from '../mixins/component';
import { connectAutocomplete } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
  props: {
    indices: {
      type: Array,
      required: false,
      default: undefined,
    },
    escapeHTML: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      widgetName: 'Autocomplete',
    };
  },
  beforeCreate() {
    this.connector = connectAutocomplete;
  },
  computed: {
    widgetParams() {
      return {
        indices: this.indices,
        escapeHits: this.escapeHTML,
      };
    },
  },
};
</script>
