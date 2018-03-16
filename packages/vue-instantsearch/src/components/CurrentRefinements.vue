<template>
  <json-tree :level="2" :data="state"></json-tree>
</template>

<script>
// todo: remove
import JsonTree from 'vue-json-tree';
import algoliaComponent from '../component';
import { connectCurrentRefinedValues } from 'instantsearch.js/es/connectors';

export default {
  components: { 'json-tree': JsonTree },
  mixins: [algoliaComponent],
  props: {
    attributes: {
      type: Array,
    },
  },
  data() {
    return {
      blockClassName: 'ais-breadcrumb',
    };
  },
  beforeCreate() {
    this.connector = connectCurrentRefinedValues;
  },
  computed: {
    widgetParams() {
      return {
        attributes: this.attributes,
      };
    },
  },
};</script>
