<template>
  <div>
    <button @click="state.refine('hi')">example refine</button>
    <slot v-bind="state">
      <pre>{{JSON.stringify(state, null, 2)}}</pre>
      <!-- ⬇ use this to dynamically debug the state-->
      <!-- <json-tree :level="2" :data="state"></json-tree> -->
    </slot>
  </div>
</template>

<script>
import JsonTree from 'vue-json-tree'; // todo: remove
import algoliaComponent from '../component';
// Uncomment and change here ⬇️
// import { connectorName } from 'instantsearch.js/es/connectors';

/* eslint-disable no-unused-vars */
// Remove this part ⬇,️ only here for testing the template
const connectorName = (renderFn, unmountFn) => ({ someProp }) => ({
  render: () => renderFn(),
});
/* eslint-enable */

export default {
  // ⬇️ this is to help you debugging what's in `state`
  // remove it before pushing the component
  components: { 'json-tree': JsonTree },
  mixins: [algoliaComponent],
  // ⬇️ Those are all the options of your widget (attribute, items ...)
  // You don't need to write down the props that will be forwarded by the connector on render,
  // They are directly accessible in the state in template
  props: {
    someProp: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      widgetName: 'Template', // ◀️ change this
    };
  },
  beforeCreate() {
    this.connector = connectorName; // ◀️ change this to the right connectorName you imported
  },
  computed: {
    // ⬇️ Those are all the options of your widget (attribute, items ...)
    // Same as props, just do the mapping
    widgetParams() {
      return {
        someProp: this.someProp,
      };
    },
  },
};
</script>
