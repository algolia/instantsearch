<template>
  <div>
    <button @click="state.refine('hi')"></button>
    <pre>{{JSON.stringify(state, null, 2)}}</pre>
    <!-- <slot v-bind="state">
      <json-tree :level="2" :data="state"></json-tree>
    </slot> -->
  </div>
</template>

<script>
import JsonTree from 'vue-json-tree'; // todo: remove
import algoliaComponent from '../component';
// import { connectBreadcrumb } from 'instantsearch.js/es/connectors';
const connect__Template = (renderFn, unmountFn) => ({ someProp }) => ({
  render: () => renderFn(),
});

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
    this.connector = connect__Template;
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
