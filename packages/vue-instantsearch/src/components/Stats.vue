<template>
  <div v-if="state" :class="suit()">
    <slot
      v-bind="state"
      :results="state.instantSearchInstance.helper.lastResults"
    >
      <!-- prettier-ignore -->
      <span :class="suit('text')"
        ><template v-if="state.areHitsSorted"
          >{{ state.nbSortedHits.toLocaleString() }} relevant results sorted out of {{ state.nbHits.toLocaleString() }}</template
        ><template v-else>{{ state.nbHits.toLocaleString() }} results</template
        > found in {{ state.processingTimeMS.toLocaleString() }}ms</span
      >
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
    createWidgetMixin(
      { connector: connectStats },
      {
        $$widgetType: 'ais.stats',
      }
    ),
    createSuitMixin({ name: 'Stats' }),
  ],
  computed: {
    widgetParams() {
      return {};
    },
  },
};
</script>
