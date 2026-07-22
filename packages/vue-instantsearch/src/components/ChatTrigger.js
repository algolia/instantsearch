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
  props: {
    floating: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  computed: {
    widgetParams() {
      return {};
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
      onClick: () => this.state.toggleOpen(),
      classNames: rootClassName ? { root: rootClassName } : undefined,
    });
  }),
};
