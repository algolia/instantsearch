import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { connectQueryRules } from 'instantsearch.js/es/connectors';

export default {
  name: 'AisQueryRuleContext',
  mixins: [
    createSuitMixin({ name: 'QueryRuleContext' }),
    createWidgetMixin({
      connector: connectQueryRules,
    }),
  ],
  props: {
    trackedFilters: {
      type: Object,
      required: true,
    },
    transformRuleContexts: {
      type: Function,
      required: false,
      default: ruleContexts => ruleContexts,
    },
  },
  computed: {
    widgetParams() {
      return {
        trackedFilters: this.trackedFilters,
        transformRuleContexts: this.transformRuleContexts,
      };
    },
  },
  render() {
    return null;
  },
};
