import { createRelatedProductsComponent } from 'instantsearch-ui-components';
import { connectRelatedProducts } from 'instantsearch.js/es/connectors/index';

import { createRecommendMixin } from '../mixins/recommend';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderCompat } from '../util/vue-compat';

export default {
  name: 'AisRelatedProducts',
  mixins: [
    createWidgetMixin(
      { connector: connectRelatedProducts },
      { $$widgetType: 'ais.relatedProducts' }
    ),
    createSuitMixin({ name: 'RelatedProducts' }),
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

    const itemSlot = getScopedSlot(this, 'item');
    const headerSlot = getScopedSlot(this, 'header');
    const emptySlot = getScopedSlot(this, 'empty');
    const layoutSlot = getScopedSlot(this, 'layout');

    return h(createRelatedProductsComponent({ createElement: h, Fragment }), {
      items: this.state.items,
      status: this.status,
      sendEvent: this.state.sendEvent,
      itemComponent: itemSlot,
      headerComponent: headerSlot,
      emptyComponent: emptySlot,
      layout: layoutSlot,
      classNames: this.classNames,
    });
  }),
};
