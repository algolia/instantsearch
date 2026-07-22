import { createTrendingFacetsComponent } from 'instantsearch-ui-components';
import { connectTrendingFacets } from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, renderReactCompat } from '../util/vue-compat';

function mapClassNames(classNames) {
  if (!classNames) {
    return undefined;
  }
  return {
    root: classNames['ais-TrendingFacets'],
    emptyRoot: classNames['ais-TrendingFacets--empty'],
    title: classNames['ais-TrendingFacets-title'],
    container: classNames['ais-TrendingFacets-container'],
    list: classNames['ais-TrendingFacets-list'],
    item: classNames['ais-TrendingFacets-item'],
  };
}

export default {
  name: 'AisTrendingFacets',
  mixins: [
    createWidgetMixin(
      { connector: connectTrendingFacets },
      { $$widgetType: 'ais.trendingFacets' }
    ),
    createSuitMixin({ name: 'TrendingFacets' }),
  ],
  props: {
    facetName: {
      type: String,
      required: true,
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
  },
  computed: {
    widgetParams() {
      return {
        facetName: this.facetName,
        limit: this.limit,
        threshold: this.threshold,
        fallbackParameters: this.fallbackParameters,
        escapeHTML: this.escapeHTML,
        transformItems: this.transformItems,
      };
    },
  },
  render: renderReactCompat(function (h) {
    const TrendingFacetsUiComponent = createTrendingFacetsComponent({
      createElement: h,
      Fragment,
    });

    return h(TrendingFacetsUiComponent, {
      items: this.state ? this.state.items : [],
      status: this.instantSearchInstance.status,
      classNames: mapClassNames(this.classNames),
    });
  }),
};
