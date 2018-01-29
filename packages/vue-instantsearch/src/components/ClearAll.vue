<template>
  <button type="reset"
          :class="[bem(), disabled ? bem(null, 'disabled') : '']"
          :disabled="disabled"
          @click.prevent="clear"
  >
    <slot>
      <span :class="bem('label')">Clear</span>
    </slot>
  </button>
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
    excludeAttributes: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      blockClassName: 'ais-clear',
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
        excludeAttributes: this.excludeAttributes,
      };
    },
  },
  methods: {
    clear() {
      this.state.refine();
    },
  },
};
</script>
