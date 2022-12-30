<template>
  <div :class="suit()">
    <slot v-bind="state">
      <button @click="state.refine('hi')" :class="suit('button')">
        example refine
      </button>
    </slot>
  </div>
</template>

<script>
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
// Uncomment and change here ⬇️
// import { connectorName } from 'instantsearch.js/es/connectors';

/* eslint-disable @typescript-eslint/no-unused-vars,no-unused-vars */
// Remove this part ⬇,️ only here for testing the template
const connectorName =
  (renderFn, unmountFn) =>
  ({ someProp }) => ({
    render: () => renderFn(),
  });
/* eslint-enable */

export default {
  name: 'AisTemplate', // ◀️ change this to the component name that will be exported
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
