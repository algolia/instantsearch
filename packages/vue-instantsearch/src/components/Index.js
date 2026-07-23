import indexWidget from 'instantsearch.js/es/widgets/index/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { renderCompat, getDefaultSlot } from '../util/vue-compat';

// wrapped in a dummy function, since indexWidget doesn't render
const connectIndex = () => indexWidget;

export default {
  name: 'AisIndex',
  mixins: [
    createSuitMixin({ name: 'Index' }),
    createWidgetMixin(
      { connector: connectIndex },
      {
        $$widgetType: 'ais.index',
      }
    ),
  ],
  provide() {
    return {
      // The widget is created & registered by widgetMixin, accessor is needed
      // because provide is not reactive.
      $_ais_getParentIndex: () => this.widget,
    };
  },
  props: {
    // Not `required` because it's optional when `isolated` is `true`. The
    // underlying index widget throws when neither `indexName` nor `isolated`
    // is provided.
    indexName: {
      type: String,
      required: false,
      default: undefined,
    },
    indexId: {
      type: String,
      required: false,
    },
    isolated: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  render: renderCompat(function (h) {
    return h('div', {}, getDefaultSlot(this));
  }),
  computed: {
    widgetParams() {
      return {
        indexName: this.indexName,
        indexId: this.indexId,
        isolated: this.isolated,
      };
    },
  },
};
