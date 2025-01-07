<template>
  <div
    v-if="state"
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :current-refinement="state.currentRefinement"
      :refine="refine"
      :can-refine="state.canRefine"
      :range="state.range"
      :send-event="state.sendEvent"
    >
      <form
        :class="suit('form')"
        @submit.prevent="
          refine({
            min: pick(minInput, state.currentRefinement.min),
            max: pick(maxInput, state.currentRefinement.max),
          })
        "
      >
        <label :class="suit('label')">
          <slot name="minLabel" />
          <input
            type="number"
            :class="[suit('input'), suit('input', 'min')]"
            :step="step"
            :min="state.range.min"
            :max="state.range.max"
            :placeholder="state.range.min"
            :value="state.currentRefinement.min"
            @change="minInput = $event.currentTarget.value"
          />
        </label>
        <span :class="suit('separator')">
          <slot name="separator">to</slot>
        </span>
        <label :class="suit('label')">
          <slot name="maxLabel" />
          <input
            :class="[suit('input'), suit('input', 'max')]"
            type="number"
            :step="step"
            :min="state.range.min"
            :max="state.range.max"
            :placeholder="state.range.max"
            :value="state.currentRefinement.max"
            @change="maxInput = $event.currentTarget.value"
          />
        </label>
        <button :class="suit('submit')" type="submit">
          <slot name="submitLabel"> Go </slot>
        </button>
      </form>
    </slot>
  </div>
</template>

<script>
import { connectRange } from 'instantsearch-core';

import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';

export default {
  name: 'AisRangeInput',
  mixins: [
    createSuitMixin({ name: 'RangeInput' }),
    createWidgetMixin(
      {
        connector: connectRange,
      },
      {
        $$widgetType: 'ais.rangeInput',
      }
    ),
    createPanelConsumerMixin(),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    min: {
      type: Number,
      required: false,
      default: undefined,
    },
    max: {
      type: Number,
      required: false,
      default: undefined,
    },
    precision: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      minInput: undefined,
      maxInput: undefined,
    };
  },
  updated() {
    this.minInput = undefined;
    this.maxInput = undefined;
  },
  computed: {
    widgetParams() {
      return {
        attribute: this.attribute,
        min: this.min,
        max: this.max,
        precision: this.precision,
      };
    },
    step() {
      return 1 / Math.pow(10, this.precision);
    },
  },
  methods: {
    pick(first, second) {
      if (first !== null && first !== undefined) {
        return first;
      } else {
        return second;
      }
    },
    refine({ min, max }) {
      this.state.refine({ min, max });
    },
  },
};
</script>
