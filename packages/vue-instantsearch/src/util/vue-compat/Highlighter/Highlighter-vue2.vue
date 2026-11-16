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
    // The `ais-reverse-*` widgets mark what the query did *not* match, so the
    // parts come back inverted.
    reversed: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return { TextNode };
  },
  computed: {
    parsedHighlights() {
      const parts = parseAlgoliaHit({
        attribute: this.attribute,
        hit: this.hit,
        highlightProperty: this.highlightProperty,
      });

      if (!this.reversed) {
        return parts;
      }

      return parts.map(({ isHighlighted, ...rest }) => ({
        ...rest,
        isHighlighted: !isHighlighted,
      }));
    },
  },
};
</script>
