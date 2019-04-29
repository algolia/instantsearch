<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot :items="state.items">
      <div
        v-for="(item, key) in state.items"
        :key="key"
      >
        <slot
          name="item"
          :item="item"
        >
          <pre>{{ item }}</pre>
        </slot>
      </div>
    </slot>
  </div>
</template>

<script>
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { connectQueryRules } from 'instantsearch.js/es/connectors';

export default {
  name: 'AisQueryRuleCustomData',
  mixins: [
    createSuitMixin({ name: 'QueryRuleCustomData' }),
    createWidgetMixin({
      connector: connectQueryRules,
    }),
  ],
  props: {
    transformItems: {
      type: Function,
      required: false,
      default: items => items,
    },
  },
  computed: {
    widgetParams() {
      return {
        transformItems: this.transformItems,
      };
    },
  },
};
</script>
