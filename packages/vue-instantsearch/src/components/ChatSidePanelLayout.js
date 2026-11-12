import { createChatSidePanelLayoutComponent } from 'instantsearch-ui-components';

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
 * Vue equivalent of react-instantsearch's `ChatSidePanelLayout` and
 * instantsearch.js's `templates.chatSidepanelLayout`: the side-panel chat
 * layout (which shifts a page element's margin while open) around the
 * `createChatSidePanelLayoutComponent` factory.
 *
 * This is also the markup `ais-chat` renders for `layout="sidePanel"`; the
 * component is exported so a custom chat can reuse it as a `layoutComponent`.
 */
export default {
  name: 'AisChatSidePanelLayout',
  mixins: [createSuitMixin({ name: 'ChatSidePanelLayout' })],
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
     * Selector of the page element whose margin shifts while the panel is
     * open. Defaults to the document body.
     */
    parentElement: { type: String, required: false, default: undefined },
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
  // The factory keeps a `WeakMap` of the page elements it has shifted, so the
  // component it creates must survive across renders (see the Vue `CLAUDE.md`
  // note on creating shared components once per instance).
  render: renderReactCompat(function (h) {
    if (!this.LayoutComponent) {
      this.LayoutComponent = createChatSidePanelLayoutComponent({
        createElement: h,
      });
    }

    return h(this.LayoutComponent, {
      open: this.open,
      maximized: this.maximized,
      parentElement: this.parentElement,
      headerComponent: renderPiece(h, this.headerComponent),
      messagesComponent: renderPiece(h, this.messagesComponent),
      promptComponent: renderPiece(h, this.promptComponent),
      classNames: this.classNames,
      ...this.$attrs,
    });
  }),
};
