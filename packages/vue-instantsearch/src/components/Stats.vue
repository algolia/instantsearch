<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      v-bind="state"
      :results="state.instantSearchInstance.helper.lastResults"
    >
      <span :class="suit('text')">{{ state.nbHits.toLocaleString() }} results found in {{ state.processingTimeMS.toLocaleString() }}ms</span>
    </slot>
  </div>
</template>

<script>
import { createWidgetMixin } from '../mixins/widget';
import { connectStats } from 'instantsearch.js/es/connectors';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisStats',
  mixins: [
    createWidgetMixin({ connector: connectStats }),
    createSuitMixin({ name: 'Stats' }),
  ],
  computed: {
    widgetParams() {
      return {};
    },
  },
};
</script>
