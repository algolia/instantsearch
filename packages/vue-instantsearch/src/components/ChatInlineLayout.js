import { createChatInlineLayoutComponent } from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { renderLayoutPiece } from '../util/layoutPiece';
import { takeRootClass } from '../util/rootClass';
import { renderReactCompat } from '../util/vue-compat';

/**
 * This is also the markup `ais-chat` renders for `layout="inline"`; the
 * component is exported so a custom chat can reuse it as a `layoutComponent`.
 */
const AisChatInlineLayout = {
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

    const { classNames, attrs } = takeRootClass(this.classNames, this.$attrs);

    return h(this.LayoutComponent, {
      headerComponent: renderLayoutPiece(h, this.headerComponent),
      messagesComponent: renderLayoutPiece(h, this.messagesComponent),
      promptComponent: renderLayoutPiece(h, this.promptComponent),
      classNames,
      ...attrs,
    });
  }),
};

// Tells `ais-chat` this layout is always visible, so it doesn't require an
// `ais-chat-trigger` (or AI mode) — the same marker the JS and React flavors
// put on their inline layout.
AisChatInlineLayout.$$inlineLayout = true;

export default AisChatInlineLayout;
