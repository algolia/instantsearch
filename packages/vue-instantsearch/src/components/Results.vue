<template>
  <div :class="suit()">

    <slot name="header"></slot>

    <slot v-for="(result, index) in results" :result="result" :index="index">
      {{index}}: Result 'objectID': {{ result.objectID }}
    </slot>

    <slot name="footer"></slot>

  </div>
</template>

<script>
import algoliaComponent from '../component';
import { connectHits } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
  props: {
    escapeHits: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      widgetName: 'ais-results',
    };
  },
  beforeCreate() {
    this.connector = connectHits;
  },
  computed: {
    results() {
      return this.state.hits;
    },
    widgetParams() {
      return {
        escapeHits: this.escapeHits,
      };
    },
  },
};</script>
