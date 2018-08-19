<template>
<div v-if="state" :class="suit()">
  <form :class="suit('form')" @submit.prevent="refine()">
    <label :class="suit('label')">
      <input :class="[suit('input'), suit('input', 'min')]" type="number" ref="minInput" :min="this.min" :placeholder="this.min"/>
    </label>
    <span :class="suit('separator')">to</span>
    <label :class="suit('label')">
      <input :class="[suit('input'), suit('input', 'max')]" type="number" ref="maxInput" :max="this.max" :placeholder="this.max"/>
    </label>
    <button :class="suit('submit')" type="submit">Go</button>
  </form>
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
    },
    max: {
      type: Number,
      required: false,
    },
    precision: {
      type: Number,
      required: false,
    },
  },
  data() {
    return {
      widgetName: 'RangeInput',
    };
  },
  beforeCreate() {
    this.connector = connectRange;
  },
  computed: {
    widgetParams() {
      return {
        attribute: this.attributeName,
        min: this.min,
        max: this.max,
        precision: this.precision,
      };
    },
  },
  methods: {
    refine() {
      const minValue =
        this.$refs.minInput.value && parseInt(this.$refs.minInput.value, 10);
      const maxValue =
        this.$refs.maxInput.value && parseInt(this.$refs.maxInput.value, 10);

      this.state.refine([minValue, maxValue]);
    },
  },
};</script>
