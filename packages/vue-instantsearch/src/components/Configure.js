import { createWidgetMixin } from '../mixins/widget';
import { createSuitMixin } from '../mixins/suit';
import { connectConfigure } from 'instantsearch.js/es/connectors';
import { isVue3, renderCompat } from '../util/vue-compat';

export default {
  inheritAttrs: false,
  name: 'AisConfigure',
  mixins: [
    createSuitMixin({ name: 'Configure' }),
    createWidgetMixin(
      {
        connector: connectConfigure,
      },
      {
        $$widgetType: 'ais.configure',
      }
    ),
  ],
  computed: {
    widgetParams() {
      return {
        searchParameters: this.$attrs,
      };
    },
  },
  render: renderCompat(function (h) {
    const slot = isVue3 ? this.$slots.default : this.$scopedSlots.default;

    if (!this.state || !slot) {
      return null;
    }

    return h(
      'div',
      {
        class: this.suit(),
      },
      [
        slot({
          refine: this.state.refine,
          searchParameters: this.state.widgetParams.searchParameters,
        }),
      ]
    );
  }),
};
