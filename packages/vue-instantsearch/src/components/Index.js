import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import indexWidget from 'instantsearch.js/es/widgets/index/index';
import { isVue3, h } from '../util/vue';

// wrapped in a dummy function, since indexWidget doesn't render
const connectIndex = () => indexWidget;

export default {
  name: 'AisIndex',
  mixins: [
    createSuitMixin({ name: 'Index' }),
    createWidgetMixin({ connector: connectIndex }),
  ],
  provide() {
    return {
      // The widget is created & registered by widgetMixin, accessor is needed
      // because provide is not reactive.
      $_ais_getParentIndex: () => this.widget,
    };
  },
  props: {
    indexName: {
      type: String,
      required: true,
    },
    indexId: {
      type: String,
      required: false,
    },
  },
  render(createElement) {
    return (isVue3 ? h : createElement)(
      'div',
      {},
      isVue3 ? this.$slots.default() : this.$slots.default
    );
  },
  computed: {
    widgetParams() {
      return {
        indexName: this.indexName,
        indexId: this.indexId,
      };
    },
  },
};
