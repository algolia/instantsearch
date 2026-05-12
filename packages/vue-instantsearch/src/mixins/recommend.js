import { isVue3 } from '../util/vue-compat';

/**
 * Mixin for recommendation widgets that wrap shared `createXxxComponent`
 * factories from `instantsearch-ui-components`. Tracks
 * `instantSearchInstance.status` reactively so the shared component can show
 * its empty state once the search settles.
 */
export const createRecommendMixin = () => ({
  data() {
    return {
      status: this.instantSearchInstance.status || 'idle',
    };
  },
  created() {
    if (typeof this.instantSearchInstance.addListener !== 'function') {
      return;
    }
    this.updateStatus = () => {
      this.status = this.instantSearchInstance.status;
    };
    this.instantSearchInstance.addListener('render', this.updateStatus);
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    if (this.updateStatus) {
      this.instantSearchInstance.removeListener('render', this.updateStatus);
    }
  },
});
