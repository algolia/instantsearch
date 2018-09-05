<template>
  <div
    v-if="state"
    :class="suit('')"
  >
    <slot
      :refine="state.refine"
      :searchParameters="state.widgetParams.searchParameters"
    />
  </div>
</template>

<script>
import algoliaComponent from '../mixins/component';
import { connectConfigure } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
  beforeCreate() {
    this.connector = connectConfigure;
  },
  data() {
    return { widgetName: 'Configure' };
  },
  computed: {
    widgetParams() {
      return {
        searchParameters: this.$attrs,
      };
    },
  },
};
</script>
