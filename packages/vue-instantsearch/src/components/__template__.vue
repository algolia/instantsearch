<template>
  <div>
    <slot v-bind="state">
      <json-tree :level="2" :data="state"></json-tree>
    </slot>
  </div>
</template>

<script>
import JsonTree from 'vue-json-tree'; // todo: remove
import algoliaComponent from '../component';
import { connectBreadcrumb } from 'instantsearch.js/es/connectors';

export default {
  components: { 'json-tree': JsonTree },
  mixins: [algoliaComponent],
  props: {
    someProp: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      blockClassName: 'ais-breadcrumb',
    };
  },
  beforeCreate() {
    this.connector = connectBreadcrumb;
  },
  computed: {
    widgetParams() {
      return {
        someProp: this.someProp,
      };
    },
  },
};</script>
