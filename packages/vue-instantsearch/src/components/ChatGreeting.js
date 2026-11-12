import { createChatGreetingComponent } from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { renderReactCompat } from '../util/vue-compat';

/**
 * Empty-screen markup for the chat (`ais-ChatGreeting`): an optional banner,
 * a heading and a subheading.
 *
 * Use it as the chat's `emptyComponent` / `empty` slot, or render it
 * standalone above the conversation.
 */
export default {
  name: 'AisChatGreeting',
  mixins: [createSuitMixin({ name: 'ChatGreeting' })],
  inheritAttrs: false,
  props: {
    /**
     * Optional banner image URL shown above the heading.
     */
    banner: { type: String, required: false, default: undefined },
    /**
     * Accessible texts for the empty screen: `heading` and `subheading`.
     */
    translations: { type: Object, required: false, default: undefined },
    /**
     * CSS classes for the greeting elements.
     */
    classNames: { type: Object, required: false, default: undefined },
  },
  created() {
    // Created once per instance: the factory is stateless, but a stable
    // component keeps Vue's patching cheap across re-renders.
    this.GreetingComponent = null;
  },
  render: renderReactCompat(function (h) {
    if (!this.GreetingComponent) {
      this.GreetingComponent = createChatGreetingComponent({
        createElement: h,
      });
    }

    return h(this.GreetingComponent, {
      banner: this.banner,
      translations: this.translations,
      classNames: this.classNames,
    });
  }),
};
