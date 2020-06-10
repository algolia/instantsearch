<template>
  <ais-highlighter
    :hit="hit"
    :attribute="attribute"
    :highlighted-tag-name="highlightedTagName"
    :suit="suit"
    highlight-property="_snippetResult"
    pre-tag="<mark>"
    post-tag="</mark>"
  />
</template>

<script>
import { createSuitMixin } from '../mixins/suit';
import AisHighlighter from './Highlighter.vue';

export default {
  name: 'AisSnippet',
  mixins: [createSuitMixin({ name: 'Snippet' })],
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
