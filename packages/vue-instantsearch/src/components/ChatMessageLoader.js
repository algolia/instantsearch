import { createChatMessageLoaderComponent } from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { renderReactCompat } from '../util/vue-compat';

/**
 * Vue equivalent of react-instantsearch's `ChatMessageLoader` and
 * instantsearch.js's `templates.chatMessageLoader`: the shared streaming
 * skeleton (`ais-ChatMessageLoader`) around the
 * `createChatMessageLoaderComponent` factory.
 *
 * Use it as the chat's `loaderComponent` / `loader` slot to restyle the
 * loading row (the chat hands it the turn context through `context`, which
 * custom loaders read — the default markup ignores it).
 */
export default {
  name: 'AisChatMessageLoader',
  mixins: [createSuitMixin({ name: 'ChatMessageLoader' })],
  inheritAttrs: false,
  props: {
    /**
     * Loader texts: `loaderText`.
     */
    translations: { type: Object, required: false, default: undefined },
    /**
     * Whether the loader renders inside a message rather than as its own row.
     * Inline loaders drop the message chrome the host already provides.
     */
    inline: { type: Boolean, required: false, default: false },
  },
  render: renderReactCompat(function (h) {
    if (!this.LoaderComponent) {
      this.LoaderComponent = createChatMessageLoaderComponent({
        createElement: h,
      });
    }

    return h(this.LoaderComponent, {
      translations: this.translations,
      inline: this.inline,
      // Extra props the chat passes to loader components (e.g. the turn
      // `context`). The default markup ignores them, but custom loaders
      // wrapped around this one may read them.
      ...this.$attrs,
    });
  }),
};
