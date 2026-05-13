import { createLookingSimilarComponent } from 'instantsearch-ui-components';
import { connectLookingSimilar } from 'instantsearch.js/es/connectors/index';

import { createRecommendMixin } from '../mixins/recommend';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderCompat } from '../util/vue-compat';

export default {
  name: 'AisLookingSimilar',
  mixins: [
    createWidgetMixin(
      { connector: connectLookingSimilar },
      { $$widgetType: 'ais.lookingSimilar' }
    ),
    createSuitMixin({ name: 'LookingSimilar' }),
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

    return h(createLookingSimilarComponent({ createElement: h, Fragment }), {
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
