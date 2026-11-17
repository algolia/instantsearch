import { createChatOverlayLayoutComponent } from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { renderLayoutPiece } from '../util/layoutPiece';
import { takeRootClass } from '../util/rootClass';
import { renderReactCompat } from '../util/vue-compat';

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

    const { classNames, attrs } = takeRootClass(this.classNames, this.$attrs);

    return h(this.LayoutComponent, {
      open: this.open,
      maximized: this.maximized,
      headerComponent: renderLayoutPiece(h, this.headerComponent),
      messagesComponent: renderLayoutPiece(h, this.messagesComponent),
      promptComponent: renderLayoutPiece(h, this.promptComponent),
      classNames,
      ...attrs,
    });
  }),
};
