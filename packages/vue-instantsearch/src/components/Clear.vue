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

export default {
  mixins: [algoliaComponent],
  props: {
    clearsQuery: {
      type: Boolean,
      required: false,
      default: true,
    },
    clearsFacets: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      blockClassName: 'ais-clear',
    };
  },
  computed: {
    disabled() {
      if (this.clearsQuery && this.searchStore.query.length > 0) {
        return false;
      }

      if (this.clearsFacets && this.searchStore.activeRefinements.length > 0) {
        return false;
      }

      return true;
    },
  },
  methods: {
    clear() {
      this.searchStore.stop();
      if (this.clearsQuery && this.searchStore.query.length > 0) {
        this.searchStore.query = '';
      }

      if (this.clearsFacets && this.searchStore.activeRefinements.length > 0) {
        this.searchStore.clearRefinements();
      }
      this.searchStore.start();
      this.searchStore.refresh();
    },
  },
};</script>
