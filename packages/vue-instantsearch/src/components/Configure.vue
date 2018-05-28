<template>
  <div :class="suit('')" v-if="state">
    <slot :searchParameters="state.widgetParams.searchParameters" :refine="state.refine">
    </slot>
  </div>
</template>

<script>
import algoliaComponent from '../component';
import { connectConfigure } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
  beforeCreate() {
    this.connector = connectConfigure;
  },
  data() {
    return { widgetName: 'Configure' };
  },
  computed: {
    widgetParams() {
      return {
        searchParameters: this.$attrs,
      };
    },
  },
};</script>
