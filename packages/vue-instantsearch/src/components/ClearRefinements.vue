<template>
  <div
    v-if="state"
    :class="suit()"
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
import { createPanelConsumerMixin } from '../mixins/panel';
import { createWidgetMixin } from '../mixins/widget';

export default {
  mixins: [
    createWidgetMixin({ connector: connectClearAll }),
    createPanelConsumerMixin({
      mapStateToCanRefine: state => state.hasRefinements,
    }),
  ],
  props: {
    clearsQuery: {
      type: Boolean,
      default: false,
    },
    excludedAttributes: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      widgetName: 'ClearRefinements',
    };
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
