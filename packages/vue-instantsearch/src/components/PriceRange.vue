<template>
  <div :class="bem()" v-show="show">

    <slot name="header"></slot>

    <span :class="bem('currency', 'left')" v-if="currencyPlacement === 'left'">
      {{ currency }}
    </span>
    <input :class="bem('input', 'from')" type="number" v-model="from" :placeholder="fromPlaceholder" >
    <span :class="bem('currency', 'right')" v-if="currencyPlacement === 'right'">
      {{ currency }}
    </span>

    <slot><span>to&nbsp;</span></slot>

    <span :class="bem('currency', 'left')" v-if="currencyPlacement === 'left'">
      {{ currency }}
    </span>
    <input :class="bem('input', 'to')" type="number" v-model="to" :placeholder="toPlaceholder" >
    <span :class="bem('currency', 'right')" v-if="currencyPlacement === 'right'">
      {{ currency }}
    </span>

    <slot name="footer"></slot>

  </div>
</template>

<script>
import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  props: {
    fromPlaceholder: {
      type: String,
      default: 'min',
    },
    toPlaceholder: {
      type: String,
      default: 'max',
    },
    attributeName: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: false,
      default: '$',
    },
    currencyPlacement: {
      type: String,
      required: false,
      default: 'left',
      validator(value) {
        return value === 'left' || value === 'right';
      },
    },
  },
  data() {
    return {
      blockClassName: 'ais-price-range',
    };
  },
  computed: {
    show() {
      return this.from || this.to || this.searchStore.totalResults > 0;
    },
    from: {
      get() {
        for (const refinement in this.searchStore.activeRefinements) {
          if (
            this.searchStore.activeRefinements[refinement].attributeName ===
              this.attributeName &&
            this.searchStore.activeRefinements[refinement].type === 'numeric' &&
            this.searchStore.activeRefinements[refinement].operator === '>'
          ) {
            return this.searchStore.activeRefinements[refinement].numericValue;
          }
        }
        return undefined;
      },
      set(rawValue) {
        const value = Number(rawValue);

        this.searchStore.stop();
        this.searchStore.removeNumericRefinement(this.attributeName, '>');
        if (value > 0) {
          this.searchStore.addNumericRefinement(this.attributeName, '>', value);
        }

        // Remove the max value if lower than the min value.
        if (value > Number(this.to)) {
          this.searchStore.removeNumericRefinement(this.attributeName, '<');
        }

        this.searchStore.start();
        this.searchStore.refresh();
      },
    },
    to: {
      get() {
        for (const refinement in this.searchStore.activeRefinements) {
          if (
            this.searchStore.activeRefinements[refinement].attributeName ===
              this.attributeName &&
            this.searchStore.activeRefinements[refinement].type === 'numeric' &&
            this.searchStore.activeRefinements[refinement].operator === '<'
          ) {
            return this.searchStore.activeRefinements[refinement].numericValue;
          }
        }
        return undefined;
      },
      set(rawValue) {
        const value = Number(rawValue);

        // Only update when `to` has reached the `from` value.
        if (value < Number(this.from)) {
          return;
        }

        this.searchStore.stop();
        this.searchStore.removeNumericRefinement(this.attributeName, '<');
        if (value > 0) {
          this.searchStore.addNumericRefinement(this.attributeName, '<', value);
        }
        this.searchStore.start();
        this.searchStore.refresh();
      },
    },
  },
};</script>
