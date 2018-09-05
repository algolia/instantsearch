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
import { connectSortBySelector } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../mixins/panel';
import algoliaComponent from '../mixins/component';

export default {
  mixins: [
    algoliaComponent,
    createPanelConsumerMixin({
      mapStateToCanRefine: state => !state.hasNoResults,
    }),
  ],
  props: {
    items: {
      type: Array,
      required: true,
    },
    transformItems: {
      type: Function,
      default(items) {
        return items;
      },
    },
  },
  beforeCreate() {
    this.connector = connectSortBySelector;
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
        transformItems: this.transformItems,
      };
    },
  },
};
</script>
