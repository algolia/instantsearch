<template>
  <div>
    <slot v-bind="state">
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
  computed: {
    widgetParams() {
      return {
        searchParameters: this.$attrs,
      };
    },
  },
};</script>
