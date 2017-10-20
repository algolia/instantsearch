<template>
  <div :class="bem()">
    <slot name="header" />

    <form @submit.prevent="onSubmit(refinement)">
      <input
        type="number"
        :class="bem('input', 'from')"
        :min="range.min"
        :max="range.max"
        :step="step"
        :placeholder="rangeForRendering.min"
        :value="refinementForRendering.min"
        @input="refinement.min = $event.target.value"
      />

      <slot name="separator">
        to
      </slot>

      <input
        type="number"
        :class="bem('input', 'to')"
        :min="range.min"
        :max="range.max"
        :step="step"
        :placeholder="rangeForRendering.max"
        :value="refinementForRendering.max"
        @input="refinement.max = $event.target.value"
      />
      <button slot="submit">
        ok
      </button>
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
      blockClassName: 'ais-range-input',
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
    this.searchStore.removeFacet(this.attributeName);
  },

  computed: {
    step({ precision }) {
      return 1 / Math.pow(10, precision);
    },

    refinement({ attributeName, searchStore }) {
      const { numericValue: min } =
        searchStore.activeRefinements.find(
          r =>
            r.attributeName === attributeName &&
            r.type === 'numeric' &&
            r.operator === '>='
        ) || {};

      const { numericValue: max } =
        searchStore.activeRefinements.find(
          r =>
            r.attributeName === attributeName &&
            r.type === 'numeric' &&
            r.operator === '<='
        ) || {};

      return {
        min,
        max,
      };
    },

    range({
      attributeName,
      precision,
      searchStore,
      min: minRange,
      max: maxRange,
    }) {
      const { min: minStat, max: maxStat } = searchStore.getFacetStats(
        attributeName
      );

      const pow = Math.pow(10, precision);

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

    rangeForRendering({ range }) {
      const { min, max } = range;

      const isMinInfinity = min === -Infinity;
      const isMaxInfinity = max === Infinity;

      return {
        min: !isMinInfinity && !isMaxInfinity ? min : '',
        max: !isMinInfinity && !isMaxInfinity ? max : '',
      };
    },

    refinementForRendering({ refinement, range }) {
      const { min: minValue, max: maxValue } = refinement;
      const { min: minRange, max: maxRange } = range;

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
};
</script>
