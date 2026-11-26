<template>
  <span :class="suit()">
    <template v-for="(part, index) in parsedHighlights">
      <!-- A separator between the values of an array-valued attribute, as the
           other flavors render them: a plain span with no class of its own. -->
      <span v-if="part.isSeparator" :key="index">{{ part.value }}</span>
      <component
        v-else
        :class="[part.isHighlighted && suit('highlighted')]"
        :key="index"
        :is="part.isHighlighted ? highlightedTagName : TextNode"
        >{{ part.value }}</component
      >
    </template>
  </span>
</template>

<script>
import { parseAlgoliaHit } from '../../parseAlgoliaHit';

// The default separator between the values of an array-valued attribute, the
// one `instantsearch-ui-components`' highlight component uses.
const SEPARATOR = ', ';

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
      const parsed = parseAlgoliaHit({
        attribute: this.attribute,
        hit: this.hit,
        highlightProperty: this.highlightProperty,
      });

      // An array-valued attribute comes back as one group of parts per value
      // (`tags: ["a match", "b match"]` highlights as two strings). Every
      // flavor joins those groups with a separator, so flatten them here and
      // put the separator between them — never marked, inverted or not.
      const groups = Array.isArray(parsed[0]) ? parsed : [parsed];
      const parts = [];

      groups.forEach((group, index) => {
        if (index > 0) {
          parts.push({
            value: SEPARATOR,
            isHighlighted: false,
            isSeparator: true,
          });
        }

        group.forEach((part) => {
          parts.push({
            ...part,
            isHighlighted: this.reversed
              ? !part.isHighlighted
              : part.isHighlighted,
          });
        });
      });

      return parts;
    },
  },
};
</script>
