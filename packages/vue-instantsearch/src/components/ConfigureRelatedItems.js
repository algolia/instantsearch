import { createWidgetMixin } from '../mixins/widget';
import { EXPERIMENTAL_connectConfigureRelatedItems } from 'instantsearch.js/es/connectors';

export default {
  inheritAttrs: false,
  name: 'AisExperimentalConfigureRelatedItems',
  mixins: [
    createWidgetMixin(
      {
        connector: EXPERIMENTAL_connectConfigureRelatedItems,
      },
      {
        $$widgetType: 'ais.configureRelatedItems',
      }
    ),
  ],
  props: {
    hit: {
      type: Object,
      required: true,
    },
    matchingPatterns: {
      type: Object,
      required: true,
    },
    transformSearchParameters: {
      type: Function,
      required: false,
    },
  },
  computed: {
    widgetParams() {
      return {
        hit: this.hit,
        matchingPatterns: this.matchingPatterns,
        transformSearchParameters: this.transformSearchParameters,
      };
    },
  },
  render() {
    return null;
  },
};
