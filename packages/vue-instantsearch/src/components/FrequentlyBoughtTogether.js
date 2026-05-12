import { createFrequentlyBoughtTogetherComponent } from 'instantsearch-ui-components';
import { connectFrequentlyBoughtTogether } from 'instantsearch.js/es/connectors/index';

import { createRecommendMixin } from '../mixins/recommend';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderCompat } from '../util/vue-compat';

export default {
  name: 'AisFrequentlyBoughtTogether',
  mixins: [
    createWidgetMixin(
      { connector: connectFrequentlyBoughtTogether },
      { $$widgetType: 'ais.frequentlyBoughtTogether' }
    ),
    createSuitMixin({ name: 'FrequentlyBoughtTogether' }),
    createRecommendMixin(),
  ],
  props: {
    objectIDs: {
      type: Array,
      required: true,
    },
    limit: {
      type: Number,
      default: undefined,
    },
    threshold: {
      type: Number,
      default: undefined,
    },
    fallbackParameters: {
      type: Object,
      default: undefined,
    },
    queryParameters: {
      type: Object,
      default: undefined,
    },
    escapeHTML: {
      type: Boolean,
      default: undefined,
    },
    transformItems: {
      type: Function,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        objectIDs: this.objectIDs,
        limit: this.limit,
        threshold: this.threshold,
        fallbackParameters: this.fallbackParameters,
        queryParameters: this.queryParameters,
        escapeHTML: this.escapeHTML,
        transformItems: this.transformItems,
      };
    },
  },
  render: renderCompat(function (h) {
    if (!this.state) {
      return null;
    }

    return h(
      createFrequentlyBoughtTogetherComponent({ createElement: h, Fragment }),
      {
        items: this.state.items,
        status: this.status,
        sendEvent: this.state.sendEvent,
        itemComponent: getScopedSlot(this, 'item'),
        headerComponent: getScopedSlot(this, 'header'),
        emptyComponent: getScopedSlot(this, 'empty'),
        layout: getScopedSlot(this, 'layout'),
        classNames: this.classNames,
      }
    );
  }),
};
