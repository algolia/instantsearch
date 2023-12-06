import { createHits } from 'instantsearch-jsx';
import { connectHitsWithInsights } from 'instantsearch.js/es/connectors';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { renderCompat, isVue2 } from '../util/vue-compat';

export default {
  name: 'AisHits',
  mixins: [
    createWidgetMixin(
      {
        connector: connectHitsWithInsights,
      },
      {
        $$widgetType: 'ais.hits',
      }
    ),
    createSuitMixin({ name: 'Hits' }),
  ],
  props: {
    escapeHTML: {
      type: Boolean,
      default: true,
    },
    transformItems: {
      type: Function,
      default: undefined,
    },
  },
  computed: {
    items() {
      return this.state.hits;
    },
    widgetParams() {
      return {
        escapeHTML: this.escapeHTML,
        transformItems: this.transformItems,
      };
    },
  },
  render: renderCompat(function (h) {
    if (!this.state) return null;

    return h(createHits({ createElement: h }), {
      hits: this.state.hits,
      hitSlot: isVue2 ? this.$scopedSlots.item : this.$slots.item,
      sendEvent: this.state.sendEvent,
      classNames: {
        item: this.suit('item'),
        list: this.suit('list'),
        root: this.suit(),
      },
    });
  }),
};
