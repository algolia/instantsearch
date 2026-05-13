import { createFilterSuggestionsComponent } from 'instantsearch-ui-components';
import { connectFilterSuggestions } from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { Fragment, getScopedSlot, renderCompat } from '../util/vue-compat';

export default {
  name: 'AisFilterSuggestions',
  mixins: [
    createWidgetMixin(
      { connector: connectFilterSuggestions },
      { $$widgetType: 'ais.filterSuggestions' }
    ),
    createSuitMixin({ name: 'FilterSuggestions' }),
  ],
  props: {
    agentId: {
      type: String,
      default: undefined,
    },
    attributes: {
      type: Array,
      default: undefined,
    },
    maxSuggestions: {
      type: Number,
      default: undefined,
    },
    debounceMs: {
      type: Number,
      default: undefined,
    },
    hitsToSample: {
      type: Number,
      default: undefined,
    },
    transformItems: {
      type: Function,
      default: undefined,
    },
    transport: {
      type: Object,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        agentId: this.agentId,
        attributes: this.attributes,
        maxSuggestions: this.maxSuggestions,
        debounceMs: this.debounceMs,
        hitsToSample: this.hitsToSample,
        transformItems: this.transformItems,
        transport: this.transport,
      };
    },
  },
  render: renderCompat(function (h) {
    if (!this.state) {
      return null;
    }

    return h(createFilterSuggestionsComponent({ createElement: h, Fragment }), {
      suggestions: this.state.suggestions,
      isLoading: this.state.isLoading,
      refine: this.state.refine,
      skeletonCount: this.maxSuggestions,
      itemComponent: getScopedSlot(this, 'item'),
      headerComponent: getScopedSlot(this, 'header'),
      emptyComponent: getScopedSlot(this, 'empty'),
      classNames: this.classNames,
    });
  }),
};
