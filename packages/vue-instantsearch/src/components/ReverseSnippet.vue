<template>
  <ais-highlighter
    :hit="hit"
    :attribute="attribute"
    :highlighted-tag-name="highlightedTagName"
    :suit="suit"
    highlight-property="_snippetResult"
    reversed
  />
</template>

<script>
import { createSuitMixin } from '../mixins/suit';
import AisHighlighter from '../util/vue-compat/Highlighter';

export default {
  name: 'AisReverseSnippet',
  mixins: [createSuitMixin({ name: 'ReverseSnippet' })],
  components: { AisHighlighter },
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
};
</script>
