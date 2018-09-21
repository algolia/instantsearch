<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      v-bind="state"
      :results="state.instantSearchInstance.helper.lastResults"
    >
      <span :class="suit('text')">
        {{ state.nbHits.toLocaleString() }} results found in {{ state.processingTimeMS.toLocaleString() }}ms
      </span>
    </slot>
  </div>
</template>

<script>
import { createWidgetMixin } from '../mixins/widget';
import { connectStats } from 'instantsearch.js/es/connectors';

export default {
  mixins: [createWidgetMixin({ connector: connectStats })],
  data() {
    return {
      widgetName: 'Stats',
    };
  },
  computed: {
    widgetParams() {
      return {};
    },
  },
};
</script>
