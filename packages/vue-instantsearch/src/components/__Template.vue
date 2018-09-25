<template>
  <div :class="suit()">
    <slot v-bind="state">
      <button
        @click="state.refine('hi')"
        :class="suit('button')"
      >
        example refine
      </button>
      <!-- ⬇ use this to dynamically debug the state, remove it when done -->
      <json-tree
        :level="2"
        :data="state"
      />
    </slot>
  </div>
</template>

<script>
import JsonTree from 'vue-json-tree'; // 👈 When done, remove this
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
// Uncomment and change here ⬇️
// import { connectorName } from 'instantsearch.js/es/connectors';

/* eslint-disable no-unused-vars */
// Remove this part ⬇,️ only here for testing the template
const connectorName = (renderFn, unmountFn) => ({ someProp }) => ({
  render: () => renderFn(),
});
/* eslint-enable */

export default {
  name: 'AisTemplate', // ◀️ change this to the component name that will be exported
  // ⬇️ this is to help you debugging what's in `state`
  // remove it before pushing the component
  components: { 'json-tree': JsonTree },
  mixins: [
    createSuitMixin({ name: 'Template' }), // ◀️ change this
    createWidgetMixin({
      connector: connectorName, // ◀️ change this to the right connectorName you imported
    }),
  ],
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
