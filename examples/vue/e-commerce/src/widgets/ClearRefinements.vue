<template>
  <div v-if="state" class="ais-ClearRefinements">
    <button
      type="reset"
      class="ais-ClearRefinements-button"
      @click.prevent="refine"
    >
      Reset filters
    </button>
  </div>
</template>

<script>
import { connectClearRefinements } from 'instantsearch-core';
import { createWidgetMixin } from 'vue-instantsearch';

export default {
  name: 'AppClearRefinements',
  mixins: [createWidgetMixin({ connector: connectClearRefinements })],
  methods: {
    refine() {
      this.state.refine();
      this.$emit('click');
    },
  },
};
</script>
