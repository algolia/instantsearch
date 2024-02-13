import { createHighlightComponent } from 'instantsearch-ui-components';
import {
  getHighlightedParts,
  getPropertyByPath,
  unescape,
} from 'instantsearch.js/es/lib/utils';

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
    preTag: {
      type: String,
      required: true,
    },
    postTag: {
      type: String,
      required: true,
    },
  },
  render() {
    const property =
      getPropertyByPath(this.hit._highlightResult, this.attribute) || [];
    const properties = Array.isArray(property) ? property : [property];

    const parts = properties.map((singleValue) =>
      getHighlightedParts(unescape(singleValue.value || ''))
    );

    return createElement(Highlight, {
      classNames: {
        root: this.suit(),
        highlighted: this.suit('highlighted'),
      },
      highlightedTagName: this.highlightedTagName,
      parts,
    });
  },
};
