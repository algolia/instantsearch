import { createHits } from 'instantsearch-jsx';
import { connectHitsWithInsights } from 'instantsearch.js/es/connectors';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { renderCompat } from '../util/vue-compat';

const augmentH = (baseH) => (tag, propsWithClassName, children) => {
  const { className, ...props } = propsWithClassName;
  return baseH(tag, Object.assign(props, { class: className }), [children]);
};

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
  render: renderCompat(function (baseH) {
    if (!this.state) return null;

    const h = augmentH(baseH);

    return createHits({ createElement: h })({
      hits: this.state.hits,
      hitSlot: this.$scopedSlots.item,
    });
  }),
};
