<template>
  <div :class="suit()">
    <slot name="header" />

    <form @submit.prevent="onSubmit(refinement)">
      <input
        type="number"
        :class="suit('input', 'from')"
        :min="range.min"
        :max="range.max"
        :step="step"
        :placeholder="rangeForRendering.min"
        :value="refinementForRendering.min"
        @input="refinement.min = $event.target.value"
      />

      <slot name="separator">
        <span :class="suit('separator')">
          to
        </span>
      </slot>

      <input
        type="number"
        :class="suit('input', 'to')"
        :min="range.min"
        :max="range.max"
        :step="step"
        :placeholder="rangeForRendering.max"
        :value="refinementForRendering.max"
        @input="refinement.max = $event.target.value"
      />
      <slot name="submit">
        <button :class="suit('submit')">Ok</button>
      </slot>
    </form>

    <slot name="footer" />
  </div>
</template>

<script>
import algoliaComponent from '../component';
import { FACET_OR } from '../store';

export default {
  mixins: [algoliaComponent],
  props: {
    attributeName: {
      type: String,
      required: true,
    },
    min: {
      type: Number,
    },
    max: {
      type: Number,
    },
    defaultRefinement: {
      type: Object,
      default() {
        return {};
      },
    },
    precision: {
      type: Number,
      default: 0,
      validator(value) {
        return value >= 0;
      },
    },
  },

  data() {
    return {
      widgetName: 'ais-range-input',
    };
  },

  created() {
    const { min: minValue, max: maxValue } = this.defaultRefinement;

    let min;
    if (minValue !== undefined) {
      min = minValue;
    } else if (this.min !== undefined) {
      min = this.min;
    }

    let max;
    if (maxValue !== undefined) {
      max = maxValue;
    } else if (this.max !== undefined) {
      max = this.max;
    }

    this.searchStore.stop();

    this.searchStore.addFacet(this.attributeName, FACET_OR);

    if (min !== undefined) {
      this.searchStore.addNumericRefinement(this.attributeName, '>=', min);
    }

    if (max !== undefined) {
      this.searchStore.addNumericRefinement(this.attributeName, '<=', max);
    }

    this.searchStore.start();
    this.searchStore.refresh();
  },

  destroyed() {
    this.searchStore.stop();
    this.searchStore.removeFacet(this.attributeName);
    this.searchStore.start();
  },

  computed: {
    step() {
      return 1 / Math.pow(10, this.precision);
    },

    refinement() {
      const { numericValue: min } =
        this.searchStore.activeRefinements.find(
          ({ attributeName, type, operator }) =>
            attributeName === this.attributeName &&
            type === 'numeric' &&
            operator === '>='
        ) || {};

      const { numericValue: max } =
        this.searchStore.activeRefinements.find(
          ({ attributeName, type, operator }) =>
            attributeName === this.attributeName &&
            type === 'numeric' &&
            operator === '<='
        ) || {};

      return {
        min,
        max,
      };
    },

    range() {
      const { min: minRange, max: maxRange } = this;
      const { min: minStat, max: maxStat } = this.searchStore.getFacetStats(
        this.attributeName
      );

      const pow = Math.pow(10, this.precision);

      let min;
      if (minRange !== undefined) {
        min = minRange;
      } else if (minStat !== undefined) {
        min = minStat;
      } else {
        min = -Infinity;
      }

      let max;
      if (maxRange !== undefined) {
        max = maxRange;
      } else if (maxStat !== undefined) {
        max = maxStat;
      } else {
        max = Infinity;
      }

      return {
        min: min !== -Infinity ? Math.floor(min * pow) / pow : min,
        max: max !== Infinity ? Math.ceil(max * pow) / pow : max,
      };
    },

    rangeForRendering() {
      const { min, max } = this.range;

      const isMinInfinity = min === -Infinity;
      const isMaxInfinity = max === Infinity;

      return {
        min: !isMinInfinity && !isMaxInfinity ? min : '',
        max: !isMinInfinity && !isMaxInfinity ? max : '',
      };
    },

    refinementForRendering() {
      const { min: minValue, max: maxValue } = this.refinement;
      const { min: minRange, max: maxRange } = this.range;

      return {
        min: minValue !== undefined && minValue !== minRange ? minValue : '',
        max: maxValue !== undefined && maxValue !== maxRange ? maxValue : '',
      };
    },
  },

  methods: {
    nextValueForRefinment(hasBound, isReset, range, value) {
      let next;
      if (!hasBound && range === value) {
        next = undefined;
      } else if (hasBound && isReset) {
        next = range;
      } else {
        next = value;
      }

      return next;
    },

    onSubmit({ min: minNext = '', max: maxNext = '' }) {
      const { min: minRange, max: maxRange } = this.range;

      const hasMinBound = this.min !== undefined;
      const hasMaxBound = this.max !== undefined;

      const isMinReset = minNext === '';
      const isMaxReset = maxNext === '';

      const minNextAsNumber = !isMinReset ? parseFloat(minNext) : undefined;
      const maxNextAsNumber = !isMaxReset ? parseFloat(maxNext) : undefined;

      const newMinNext = this.nextValueForRefinment(
        hasMinBound,
        isMinReset,
        minRange,
        minNextAsNumber
      );

      const newMaxNext = this.nextValueForRefinment(
        hasMaxBound,
        isMaxReset,
        maxRange,
        maxNextAsNumber
      );

      this.searchStore.stop();

      this.searchStore.removeNumericRefinement(this.attributeName, '>=');
      if (newMinNext !== undefined) {
        this.searchStore.addNumericRefinement(
          this.attributeName,
          '>=',
          newMinNext
        );
      }

      this.searchStore.removeNumericRefinement(this.attributeName, '<=');
      if (newMaxNext !== undefined) {
        this.searchStore.addNumericRefinement(
          this.attributeName,
          '<=',
          newMaxNext
        );
      }

      this.searchStore.start();
      this.searchStore.refresh();
    },
  },
};</script>
