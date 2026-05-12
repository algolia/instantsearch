import { createTrendingItemsComponent } from 'instantsearch-ui-components';
import { connectTrendingItems } from 'instantsearch.js/es/connectors/index';

import { createRecommendMixin } from '../mixins/recommend';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderCompat } from '../util/vue-compat';

export default {
  name: 'AisTrendingItems',
  mixins: [
    createWidgetMixin(
      { connector: connectTrendingItems },
      { $$widgetType: 'ais.trendingItems' }
    ),
    createSuitMixin({ name: 'TrendingItems' }),
    createRecommendMixin(),
  ],
  props: {
    facetName: {
      type: String,
      default: undefined,
    },
    facetValue: {
      type: String,
      default: undefined,
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
      const facetParameters =
        this.facetName && this.facetValue
          ? { facetName: this.facetName, facetValue: this.facetValue }
          : {};
      return {
        ...facetParameters,
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

    return h(createTrendingItemsComponent({ createElement: h, Fragment }), {
      items: this.state.items,
      status: this.status,
      sendEvent: this.state.sendEvent,
      itemComponent: getScopedSlot(this, 'item'),
      headerComponent: getScopedSlot(this, 'header'),
      emptyComponent: getScopedSlot(this, 'empty'),
      layout: getScopedSlot(this, 'layout'),
      classNames: this.classNames,
    });
  }),
};
