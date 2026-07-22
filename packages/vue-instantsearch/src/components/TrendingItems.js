import { createTrendingItemsComponent } from 'instantsearch-ui-components';
import { connectTrendingItems } from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, renderReactCompat } from '../util/vue-compat';

import AisCarousel from './Carousel';

function mapClassNames(classNames) {
  if (!classNames) {
    return undefined;
  }
  return {
    root: classNames['ais-TrendingItems'],
    emptyRoot: classNames['ais-TrendingItems--empty'],
    title: classNames['ais-TrendingItems-title'],
    container: classNames['ais-TrendingItems-container'],
    list: classNames['ais-TrendingItems-list'],
    item: classNames['ais-TrendingItems-item'],
  };
}

export default {
  name: 'AisTrendingItems',
  mixins: [
    createWidgetMixin(
      { connector: connectTrendingItems },
      { $$widgetType: 'ais.trendingItems' }
    ),
    createSuitMixin({ name: 'TrendingItems' }),
  ],
  props: {
    facetName: {
      type: String,
      required: false,
      default: undefined,
    },
    facetValue: {
      type: String,
      required: false,
      default: undefined,
    },
    limit: {
      type: Number,
      required: false,
      default: undefined,
    },
    threshold: {
      type: Number,
      required: false,
      default: undefined,
    },
    fallbackParameters: {
      type: Object,
      required: false,
      default: undefined,
    },
    queryParameters: {
      type: Object,
      required: false,
      default: undefined,
    },
    escapeHTML: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    transformItems: {
      type: Function,
      required: false,
      default: undefined,
    },
    layout: {
      type: String,
      required: false,
      default: 'list',
      validator: (value) => ['list', 'carousel'].indexOf(value) !== -1,
    },
  },
  computed: {
    widgetParams() {
      return {
        facetName: this.facetName,
        facetValue: this.facetValue,
        limit: this.limit,
        threshold: this.threshold,
        fallbackParameters: this.fallbackParameters,
        queryParameters: this.queryParameters,
        escapeHTML: this.escapeHTML,
        transformItems: this.transformItems,
      };
    },
  },
  render: renderReactCompat(function (h) {
    const TrendingItemsUiComponent = createTrendingItemsComponent({
      createElement: h,
      Fragment,
    });

    return h(TrendingItemsUiComponent, {
      items: this.state ? this.state.items : [],
      status: this.instantSearchInstance.status,
      sendEvent: this.state ? this.state.sendEvent : () => {},
      classNames: mapClassNames(this.classNames),
      layout: this.layout === 'carousel' ? AisCarousel : undefined,
    });
  }),
};
