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
    attributes: {
      type: Array,
      required: true,
    },
    rootPath: {
      type: String,
    },
    separator: {
      type: String,
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
        attributes: this.attributes,
        rootPath: this.rootPath,
        separator: this.separator,
      };
    },
  },
};</script>
