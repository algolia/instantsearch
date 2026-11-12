import { createChatInlineLayoutComponent } from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { renderReactCompat } from '../util/vue-compat';

/**
 * Renders a layout piece: an already-rendered element (what the chat hands
 * its built-in layouts) passes through, a Vue component object or a
 * React-style render function gets rendered in tag position.
 */
function renderPiece(h, piece) {
  if (!piece) {
    return piece;
  }
  if (typeof piece === 'function' || typeof piece.render === 'function') {
    return h(piece);
  }
  return piece;
}

/**
 * This is also the markup `ais-chat` renders for `layout="inline"`; the
 * component is exported so a custom chat can reuse it as a `layoutComponent`.
 */
export default {
  name: 'AisChatInlineLayout',
  mixins: [createSuitMixin({ name: 'ChatInlineLayout' })],
  inheritAttrs: false,
  props: {
    /**
     * The chat's header: an element, a Vue component, or a render function.
     */
    headerComponent: {
      type: [Function, Object],
      required: false,
      default: undefined,
    },
    /**
     * The chat's messages: an element, a Vue component, or a render function.
     */
    messagesComponent: {
      type: [Function, Object],
      required: false,
      default: undefined,
    },
    /**
     * The chat's prompt: an element, a Vue component, or a render function.
     */
    promptComponent: {
      type: [Function, Object],
      required: false,
      default: undefined,
    },
    /**
     * CSS classes for the layout elements (`root`, `container`).
     */
    classNames: { type: Object, required: false, default: undefined },
  },
  render: renderReactCompat(function (h) {
    if (!this.LayoutComponent) {
      this.LayoutComponent = createChatInlineLayoutComponent({
        createElement: h,
      });
    }

    return h(this.LayoutComponent, {
      headerComponent: renderPiece(h, this.headerComponent),
      messagesComponent: renderPiece(h, this.messagesComponent),
      promptComponent: renderPiece(h, this.promptComponent),
      classNames: this.classNames,
      ...this.$attrs,
    });
  }),
};
