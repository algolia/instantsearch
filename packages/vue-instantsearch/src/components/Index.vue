<template>
  <!-- Index is an empty component that will hold other widgets -->
  <div :class="suit()">
    <slot></slot>
  </div>
</template>

<script>
import suit from '../suit.js';
import instantsearch from 'instantsearch.js/es/';

export default {
  provide() {
    this.instantSearchInstance = instantsearch({
      appId: this.appId,
      apiKey: this.apiKey,
      indexName: this.indexName,
      routing: this.routing,
      stalledSearchDelay: this.stalledSearchDelay,
    });

    return {
      instantSearchInstance: this.instantSearchInstance,
    };
  },
  props: {
    apiKey: {
      type: String,
      required: true,
    },
    appId: {
      type: String,
      required: true,
    },
    indexName: {
      type: String,
      required: true,
    },
    routing: {
      type: [Boolean, Object],
    },
    stalledSearchDelay: {
      type: Number,
    },
  },
  data() {
    return {
      widgetName: 'Index',
    };
  },
  mounted() {
    // from the documentation: https://vuejs.org/v2/api/#mounted
    // "Note that mounted does not guarantee that all child components have also been mounted. If you want to
    // wait until the entire view has been rendered, you can use vm.$nextTick inside of mounted"
    this.$nextTick(() => {
      this.instantSearchInstance.start();
    });
  },
  methods: {
    suit(...args) {
      return suit(this.widgetName, ...args);
    },
  },
};</script>
