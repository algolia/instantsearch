import { createTrendingFacetsComponent } from 'instantsearch-ui-components';
import { connectTrendingFacets } from 'instantsearch.js/es/connectors/index';

import { createRecommendMixin } from '../mixins/recommend';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderCompat } from '../util/vue-compat';

export default {
  name: 'AisTrendingFacets',
  mixins: [
    createWidgetMixin(
      { connector: connectTrendingFacets },
      { $$widgetType: 'ais.trendingFacets' }
    ),
    createSuitMixin({ name: 'TrendingFacets' }),
    createRecommendMixin(),
  ],
  props: {
    facetName: {
      type: String,
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
        facetName: this.facetName,
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

    return h(createTrendingFacetsComponent({ createElement: h, Fragment }), {
      items: this.state.items,
      status: this.status,
      itemComponent: getScopedSlot(this, 'item'),
      headerComponent: getScopedSlot(this, 'header'),
      emptyComponent: getScopedSlot(this, 'empty'),
      classNames: this.classNames,
    });
  }),
};
