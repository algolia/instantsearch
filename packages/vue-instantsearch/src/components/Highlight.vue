<template>
  <span
    :class="suit()"
    v-html="innerHTML"
  />
</template>

<script>
import instantsearch from 'instantsearch.js/es';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisHighlight',
  mixins: [createSuitMixin({ name: 'Highlight' })],
  props: {
    hit: {
      type: Object,
      required: true,
    },
    attribute: {
      type: String,
      required: true,
    },
    highlightedTagName: {
      type: String,
      default: 'mark',
    },
  },
  computed: {
    innerHTML() {
      return instantsearch.highlight({
        attribute: this.attribute,
        hit: this.hit,
        highlightedTagName: this.highlightedTagName,
      });
    },
  },
};
</script>
