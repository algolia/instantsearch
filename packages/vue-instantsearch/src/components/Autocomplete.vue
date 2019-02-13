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
import { createWidgetMixin } from '../mixins/widget';
import { connectAutocomplete } from 'instantsearch.js/es/connectors';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisAutocomplete',
  mixins: [
    createWidgetMixin({ connector: connectAutocomplete }),
    createSuitMixin({ name: 'Autocomplete' }),
  ],
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
  computed: {
    widgetParams() {
      return {
        indices: this.indices,
        escapeHTML: this.escapeHTML,
      };
    },
  },
};
</script>
