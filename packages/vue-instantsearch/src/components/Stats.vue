<template>
  <div v-if="state" :class="suit()">
    <slot
      v-bind="state"
      :results="state.instantSearchInstance.helper.lastResults"
    >
      <!-- prettier-ignore -->
      <span :class="suit('text')"
        ><template v-if="state.areHitsSorted"
          >{{ getSortedResultsSentence() }}</template
        ><template v-else>{{ getResultsSentence() }}</template
        > found in {{ state.processingTimeMS.toLocaleString() }}ms</span
      >
    </slot>
  </div>
</template>

<script>
import { connectStats } from 'instantsearch.js/es/connectors';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';

export default {
  name: 'AisStats',
  methods: {
    getSortedResultsSentence() {
      const { nbHits, nbSortedHits } = this.state;

      const suffix = `sorted out of ${nbHits.toLocaleString()}`;

      if (nbSortedHits === 0) {
        return `No relevant results ${suffix}`;
      }

      if (nbSortedHits === 1) {
        return `1 relevant result ${suffix}`;
      }

      if (nbSortedHits > 1) {
        return `${(
          nbSortedHits || 0
        ).toLocaleString()} relevant results ${suffix}`;
      }

      return '';
    },
    getResultsSentence() {
      const { nbHits } = this.state;

      if (nbHits === 0) {
        return 'No results';
      }

      if (nbHits === 1) {
        return '1 result';
      }

      if (nbHits > 1) {
        return `${nbHits.toLocaleString()} results`;
      }

      return '';
    },
  },
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
