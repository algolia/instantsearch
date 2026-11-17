import { createChatGreetingComponent } from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { takeRootClass } from '../util/rootClass';
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

    // `inheritAttrs` is off so the shared component owns the root element:
    // undeclared attributes (`id`, `aria-*`, `data-*`, the chat `context`, the
    // `class` binding …) have to be handed over, since the factory spreads them
    // onto that root. `class` goes in through `classNames`, because the factory
    // puts its own `className` on the root.
    const { classNames, attrs } = takeRootClass(this.classNames, this.$attrs);

    return h(this.GreetingComponent, {
      banner: this.banner,
      translations: this.translations,
      classNames,
      ...attrs,
    });
  }),
};
