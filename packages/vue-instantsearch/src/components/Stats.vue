<template>
  <div :class="suit()" v-if="state">
    <slot v-bind="state" :results="state.instantSearchInstance.helper.lastResults">
      <span :class="suit('text')">
        {{ state.nbHits.toLocaleString() }} results found in {{ state.processingTimeMS.toLocaleString() }}ms
      </span>
    </slot>
  </div>
</template>

<script>
import algoliaComponent from '../component';
import { connectStats } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
  data() {
    return {
      widgetName: 'Stats',
    };
  },
  beforeCreate() {
    this.connector = connectStats;
  },
  computed: {
    widgetParams() {
      return {};
    },
  },
};</script>
