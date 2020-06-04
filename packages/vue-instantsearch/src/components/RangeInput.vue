<template>
  <div
    v-if="state"
    :class="[suit(), !canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :current-refinement="values"
      :refine="refine"
      :can-refine="canRefine"
      :range="state.range"
    >
      <form
        :class="suit('form')"
        @submit.prevent="refine({ min: pick(minInput, values.min), max: pick(maxInput, values.max) })"
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
            :value="values.min"
            @change="minInput = $event.currentTarget.value"
          >
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
            :value="values.max"
            @change="maxInput = $event.currentTarget.value"
          >
        </label>
        <button
          :class="suit('submit')"
          type="submit"
        >
          <slot name="submitLabel">Go</slot>
        </button>
      </form>
    </slot>
  </div>
</template>

<script>
import { connectRange } from 'instantsearch.js/es/connectors';
import { createWidgetMixin } from '../mixins/widget';
import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';

const mapStateToCanRefine = state =>
  state && state.range && state.range.min !== state.range.max;

export default {
  name: 'AisRangeInput',
  mixins: [
    createSuitMixin({ name: 'RangeInput' }),
    createWidgetMixin({ connector: connectRange }),
    createPanelConsumerMixin({
      mapStateToCanRefine,
    }),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    min: {
      type: Number,
      required: false,
      default: -Infinity,
    },
    max: {
      type: Number,
      required: false,
      default: Infinity,
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
    canRefine() {
      return mapStateToCanRefine(this.state);
    },
    step() {
      return 1 / Math.pow(10, this.precision);
    },
    values() {
      const [minValue, maxValue] = this.state.start;
      const { min: minRange, max: maxRange } = this.state.range;

      return {
        min: minValue !== -Infinity && minValue !== minRange ? minValue : null,
        max: maxValue !== Infinity && maxValue !== maxRange ? maxValue : null,
      };
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
      this.state.refine([min, max]);
    },
  },
};
</script>
