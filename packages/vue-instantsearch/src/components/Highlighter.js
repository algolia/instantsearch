import { getHighlightedParts, getPropertyByPath } from 'instantsearch-core';
import { createHighlightComponent } from 'instantsearch-ui-components';

import { createElement, Fragment } from '../util/pragma';

const Highlight = createHighlightComponent({ createElement, Fragment });

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
  render() {
    const property =
      getPropertyByPath(this.hit[this.highlightProperty], this.attribute) || [];
    const properties = Array.isArray(property) ? property : [property];

    const parts = properties.map((singleValue) =>
      getHighlightedParts(singleValue.value || '').map(
        ({ value, isHighlighted }) => ({
          // We have to do this because Vue gets rid of TextNodes with a single white space
          value: value === ' ' ? '  ' : value,
          isHighlighted: this.reversed ? !isHighlighted : isHighlighted,
        })
      )
    );

    return createElement(Highlight, {
      classNames: {
        root: this.suit(),
        highlighted: this.suit('highlighted'),
      },
      highlightedTagName: this.highlightedTagName,
      nonHighlightedTagName: Fragment,
      parts,
    });
  },
};
