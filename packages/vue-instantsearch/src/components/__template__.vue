<template>
  <json-tree :level="2" :data="state"></json-tree>
</template>

<script>
// todo: remove
import JsonTree from 'vue-json-tree';
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
};
</script>
