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
import { connectHierarchicalMenu } from 'instantsearch.js/es/connectors';

export default {
  components: { 'json-tree': JsonTree },
  mixins: [algoliaComponent],
  props: {
    attributes: {
      type: Array,
      required: true,
    },
    limit: {
      type: Number,
      required: false,
    },
    showMore: {
      type: Boolean,
      required: false,
      default: false,
    },
    showMoreLimit: {
      type: Number,
      required: false,
      default: 20,
    },
    separator: {
      type: String,
      required: false,
    },
    rootPath: {
      type: String,
      required: false,
    },
    showParentLevel: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      widgetName: 'ais-hierarchical-menu',
      isShowingMore: false,
    };
  },
  beforeCreate() {
    this.connector = connectHierarchicalMenu;
  },
  computed: {
    widgetParams() {
      return {
        attributes: this.attributes,
        limit:
          this.showMore && this.isShowingMore ? this.showMoreLimit : this.limit,
        separator: this.separator,
        rootPath: this.rootPath,
        showParentLevel: this.showParentLevel,
      };
    },
  },
  methods: {
    toggleShowMore() {
      this.isShowingMore = !this.isShowingMore;
    },
  },
};</script>
