<template>
  <span :class="suit()">
    <component
      v-for="({ value, isHighlighted }, index) in parsedHighlights"
      :class="[isHighlighted && suit('highlighted')]"
      :key="index"
      :is="isHighlighted ? highlightedTagName : TextNode"
      >{{ value }}</component
    >
  </span>
</template>

<script>
import { parseAlgoliaHit } from '../../parseAlgoliaHit';

const TextNode = {
  render() {
    return this.$slots.default;
  },
};

export default {
  name: 'AisHighlighter',
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
    suit: {
      type: Function,
      required: true,
    },
    highlightProperty: {
      type: String,
      required: true,
    },
    preTag: {
      type: String,
      required: true,
    },
    postTag: {
      type: String,
      required: true,
    },
  },
  data() {
    return { TextNode };
  },
  computed: {
    parsedHighlights() {
      return parseAlgoliaHit({
        attribute: this.attribute,
        hit: this.hit,
        highlightProperty: this.highlightProperty,
        preTag: this.preTag,
        postTag: this.postTag,
      });
    },
  },
};
</script>
