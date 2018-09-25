import { createWidgetMixin } from '../mixins/widget';
import { createSuitMixin } from '../mixins/suit';
import { connectConfigure } from 'instantsearch.js/es/connectors';

export default {
  inheritAttrs: false,
  name: 'AisConfigure',
  mixins: [
    createSuitMixin({ name: 'Configure' }),
    createWidgetMixin({ connector: connectConfigure }),
  ],
  computed: {
    widgetParams() {
      return {
        searchParameters: this.$attrs,
      };
    },
  },
  render(createElement) {
    if (!this.state || !this.$scopedSlots.default) {
      return null;
    }

    return createElement(
      'div',
      {
        class: this.suit(),
      },
      [
        this.$scopedSlots.default({
          refine: this.state.refine,
          searchParameters: this.state.widgetParams.searchParameters,
        }),
      ]
    );
  },
};
