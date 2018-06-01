<template>
  <div v-if="state" :class="suit()">
    <slot :hasRefinements="state.hasRefinements" :refine="state.refine">
      <button
        type="reset"
        :class="[suit(), disabled ? suit(null, 'disabled') : '']"
        :disabled="disabled"
        @click.prevent="state.refine"
      >
        <span :class="suit('label')">Clear</span>
      </button>
    </slot>
  </div>
</template>

<script>
import algoliaComponent from '../component';
import { connectClearAll } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
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
  },
  data() {
    return {
      widgetName: 'ais-clear-refinements',
    };
  },
  beforeCreate() {
    this.connector = connectClearAll;
  },
  computed: {
    disabled() {
      return !this.state.hasRefinements;
    },
    widgetParams() {
      return {
        clearsQuery: this.clearsQuery,
        excludeAttributes: this.excludedAttributes,
      };
    },
  },
};</script>
