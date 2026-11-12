import { createChatOverlayLayoutComponent } from 'instantsearch-ui-components';

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
  // A component (Vue options object or React-style render function) is
  // rendered in tag position; an already-rendered element passes through.
  if (typeof piece === 'function' || typeof piece.render === 'function') {
    return h(piece);
  }
  return piece;
}

/**
 * The floating-panel chat layout: the header, messages and prompt stack in a
 * panel that slides in when `open`.
 *
 * This is also the markup `ais-chat` renders for its default `overlay`
 * layout; the component is exported so a custom chat can reuse it, e.g. as a
 * `layoutComponent` that adds a wrapper around the built-in pieces.
 */
export default {
  name: 'AisChatOverlayLayout',
  mixins: [createSuitMixin({ name: 'ChatOverlayLayout' })],
  inheritAttrs: false,
  props: {
    /**
     * Whether the chat panel is open.
     */
    open: { type: Boolean, required: false, default: false },
    /**
     * Whether the chat panel fills the viewport.
     */
    maximized: { type: Boolean, required: false, default: false },
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
      this.LayoutComponent = createChatOverlayLayoutComponent({
        createElement: h,
      });
    }

    return h(this.LayoutComponent, {
      open: this.open,
      maximized: this.maximized,
      headerComponent: renderPiece(h, this.headerComponent),
      messagesComponent: renderPiece(h, this.messagesComponent),
      promptComponent: renderPiece(h, this.promptComponent),
      classNames: this.classNames,
      ...this.$attrs,
    });
  }),
};
