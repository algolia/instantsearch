import { connectQueryRules } from 'instantsearch-core';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';

export default {
  name: 'AisQueryRuleContext',
  mixins: [
    createSuitMixin({ name: 'QueryRuleContext' }),
    createWidgetMixin(
      {
        connector: connectQueryRules,
      },
      {
        $$widgetType: 'ais.queryRuleContext',
      }
    ),
  ],
  props: {
    trackedFilters: {
      type: Object,
      required: true,
    },
    transformRuleContexts: {
      type: Function,
      required: false,
      default: undefined,
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
