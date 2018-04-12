<template>
  <div :class="suit()">
    <slot v-bind="state">
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
      return {}
    }
  }
};</script>
