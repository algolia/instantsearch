<template>
  <div
    v-if="state"
    :class="suit('')"
  >
    <slot
      :can-refine="canRefine"
      :refine="state.refine"
      :createURL="state.createURL"
    >
      <button
        type="reset"
        :class="[suit('button'), !canRefine && suit('button', 'disabled')]"
        :disabled="!canRefine"
        @click.prevent="state.refine"
      >
        <slot name="resetLabel">
          Clear refinements
        </slot>
      </button>
    </slot>
  </div>
</template>

<script>
import { connectClearAll } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../panel';
import algoliaComponent from '../component';

export default {
  mixins: [
    algoliaComponent,
    createPanelConsumerMixin({
      mapStateToCanRefine: state => state.hasRefinements,
    }),
  ],
  props: {
    clearsQuery: {
      type: Boolean,
      required: false,
      default: false,
    },
    excludedAttributes: {
      type: Array,
      required: false,
      default: () => [],
    },
    transformItems: {
      type: Function,
      required: false,
      default: x => x,
    },
  },
  data() {
    return {
      widgetName: 'ClearRefinements',
    };
  },
  beforeCreate() {
    this.connector = connectClearAll;
  },
  computed: {
    widgetParams() {
      return {
        clearsQuery: this.clearsQuery,
        excludeAttributes: this.excludedAttributes,
        transformItems: this.transformItems,
      };
    },
    canRefine() {
      return this.state.hasRefinements;
    },
  },
};
</script>
