import algoliaComponent from '../mixins/component';
import { connectConfigure } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
  beforeCreate() {
    this.connector = connectConfigure;
  },
  data() {
    return { widgetName: 'Configure' };
  },
  computed: {
    widgetParams() {
      return {
        searchParameters: this.$attrs,
      };
    },
  },
  render(createElement) {
    if (!this.state || !this.$scopedSlots.default) {
      return null;
    }

    return createElement(
      'div',
      {
        class: this.suit(),
      },
      [
        this.$scopedSlots.default({
          refine: this.state.refine,
          searchParameters: this.state.widgetParams.searchParameters,
        }),
      ]
    );
  },
};
