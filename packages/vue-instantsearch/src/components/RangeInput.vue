<template>
<div v-if="state" :class="{[suit()]: true, [suit(undefined, 'noRefinement')]: noRefinement}">
  <slot
    :currentRefinements="state.start"
    :refine="refine"
    :noRefinement="noRefinement"
    :range="state.range"
  >
  <form :class="suit('form')" @submit.prevent="refine(minInput, maxInput)">
    <label :class="suit('label')">
      <slot name="minLabel"></slot>
      <input
        type="number"
        :class="[suit('input'), suit('input', 'min')]"
        :max="maxPossibleValue"
        :min="minPossibleValue"
        :placeholder="minPossibleValue"
        :step="step"
        :value="state.start && state.start[0]"
        @change="minInput = $event.currentTarget.value"
      />
    </label>
    <span :class="suit('separator')"><slot name="separator">to</slot></span>
    <label :class="suit('label')">
      <slot name="maxLabel"></slot>
      <input
        :class="[suit('input'), suit('input', 'max')]"
        type="number"
        :max="maxPossibleValue"
        :min="minPossibleValue"
        :placeholder="maxPossibleValue"
        :step="step"
        :value="state.start && state.start[1]"
        @change="maxInput = $event.currentTarget.value"
      />
    </label>
    <button :class="suit('submit')" type="submit"><slot name="submitLabel">Go</slot></button>
  </form>
  </slot>
</div>
</template>

<script>
import algoliaComponent from '../component';
import { connectRange } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
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
      widgetName: 'RangeInput',
      minInput: undefined,
      maxInput: undefined,
    };
  },
  beforeCreate() {
    this.connector = connectRange;
  },
  computed: {
    widgetParams() {
      return {
        attributeName: this.attribute,
        min: this.min,
        max: this.max,
        precision: this.precision,
      };
    },
    noRefinement() {
      return Boolean(
        this.state &&
          this.state.range &&
          this.state.range.min === this.state.range.max
      );
    },
    step() {
      return 1 / Math.pow(10, this.precision);
    },
    minPossibleValue() {
      return Math.max(this.min, this.state.range.min);
    },
    maxPossibleValue() {
      return Math.min(this.max, this.state.range.max);
    },
  },
  methods: {
    refine(min, max) {
      this.state.refine([min, max]);
    },
  },
};</script>
