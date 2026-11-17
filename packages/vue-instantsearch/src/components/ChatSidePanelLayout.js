import { createChatSidePanelLayoutComponent } from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { renderLayoutPiece } from '../util/layoutPiece';
import { takeRootClass } from '../util/rootClass';
import { renderReactCompat } from '../util/vue-compat';

/**
 * The side-panel chat layout: a panel docked to the side of the viewport,
 * shifting a page element's margin while open (see the `parentElement` prop).
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

    const { classNames, attrs } = takeRootClass(this.classNames, this.$attrs);

    return h(this.LayoutComponent, {
      open: this.open,
      maximized: this.maximized,
      parentElement: this.parentElement,
      headerComponent: renderLayoutPiece(h, this.headerComponent),
      messagesComponent: renderLayoutPiece(h, this.messagesComponent),
      promptComponent: renderLayoutPiece(h, this.promptComponent),
      classNames,
      ...attrs,
    });
  }),
};
