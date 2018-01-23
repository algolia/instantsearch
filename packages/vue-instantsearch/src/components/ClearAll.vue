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
      widget: undefined,
      state: {},
    };
  },
  created() {
    this.widget = connectClearAll(this.updateData);

    this._instance.addWidget(
      this.widget({
        clearsQuery: this.clearsQuery,
        excludeAttributes: this.excludeAttributes,
      })
    );
  },
  beforeDestroy() {
    this._instance.removeWidget(this.widget);
  },
  computed: {
    disabled() {
      return !this.state.hasRefinements;
    },
  },
  methods: {
    updateData(state = {}, isFirstRendering) {
      this.state = state;
    },
    clear() {
      this.state.refine();
    },
  },
};
</script>
