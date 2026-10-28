import { createChatToggleButtonComponent } from 'instantsearch-ui-components';
import { connectChatTrigger } from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, renderReactCompat } from '../util/vue-compat';

export default {
  name: 'AisChatTrigger',
  mixins: [
    createWidgetMixin(
      { connector: connectChatTrigger },
      { $$widgetType: 'ais.chatTrigger' }
    ),
    createSuitMixin({ name: 'ChatToggleButton' }),
  ],
  // Declared so Vue 3 doesn't also bind a `@click` listener natively on the
  // root button (it would fire twice).
  emits: ['click'],
  props: {
    /**
     * Whether the button is positioned as a floating action button at the
     * bottom-right of the viewport. Set to `false` to render an inline button
     * that flows with surrounding content.
     */
    floating: {
      type: Boolean,
      required: false,
      default: true,
    },
    /**
     * Custom icon component to replace the default sparkles/chevron icons.
     */
    toggleIconComponent: {
      type: [Function, Object],
      required: false,
      default: undefined,
    },
    /**
     * Accessible labels for the button: `openLabel` and `closeLabel`.
     */
    translations: {
      type: Object,
      required: false,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {};
    },
  },
  methods: {
    handleClick() {
      this.state.toggleOpen();
      this.$emit('click');
    },
  },
  render: renderReactCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const ChatToggleButton = createChatToggleButtonComponent({
      createElement: h,
      Fragment,
    });

    const rootClassName = [
      this.floating && 'ais-ChatToggleButton--floating',
      this.classNames && this.classNames['ais-ChatToggleButton'],
    ]
      .filter(Boolean)
      .join(' ');

    return h(ChatToggleButton, {
      open: this.state.open,
      onClick: this.handleClick,
      classNames: rootClassName ? { root: rootClassName } : undefined,
      toggleIconComponent: this.toggleIconComponent,
      translations: this.translations,
    });
  }),
};
