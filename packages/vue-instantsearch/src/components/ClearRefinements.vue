<template>
  <div v-if="state" :class="suit()">
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
        <slot name="resetLabel"> Clear refinements </slot>
      </button>
    </slot>
  </div>
</template>

<script>
import { connectClearRefinements } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';

export default {
  name: 'AisClearRefinements',
  mixins: [
    createWidgetMixin(
      {
        connector: connectClearRefinements,
      },
      {
        $$widgetType: 'ais.clearRefinements',
      }
    ),
    createPanelConsumerMixin(),
    createSuitMixin({ name: 'ClearRefinements' }),
  ],
  props: {
    excludedAttributes: {
      type: Array,
      default: undefined,
    },
    includedAttributes: {
      type: Array,
      default: undefined,
    },
    transformItems: {
      type: Function,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        includedAttributes: this.includedAttributes,
        excludedAttributes: this.excludedAttributes,
        transformItems: this.transformItems,
      };
    },
    canRefine() {
      return this.state.hasRefinements;
    },
  },
};
</script>
