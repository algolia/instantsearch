<template>
  <div
    :class="suit('')"
    v-if="state"
  >
    <slot
      :items="state.options"
      :has-no-results="state.hasNoResults"
      :refine="state.refine"
      :current-refinement="state.currentRefinement"
    >
      <select
        :class="suit('select')"
        @change="state.refine($event.currentTarget.value)"
      >
        <option
          v-for="item in state.options"
          :key="item.value"
          :class="suit('option')"
          :value="item.value"
          :selected="item.value === state.currentRefinement"
        >
          {{ item.label }}
        </option>
      </select>
    </slot>
  </div>
</template>

<script>
import algoliaComponent from '../component';
import { connectSortBySelector } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      widgetName: 'SortBy',
    };
  },
  computed: {
    widgetParams() {
      return {
        indices: this.items,
      };
    },
  },
  beforeCreate() {
    this.connector = connectSortBySelector;
  },
};
</script>
