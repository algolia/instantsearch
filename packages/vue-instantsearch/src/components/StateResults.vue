<template>
  <div :class="suit()" v-if="state && state.state && state.results">
    <slot v-bind="state">
      <p>
        Use this component to have a different layout based on a certain state.
      </p>
      <p>Fill in the slot, and get access to the following things:</p>
      <pre>results: {{ Object.keys(state.results) }}</pre>
      <pre>state: {{ Object.keys(state.state) }}</pre>
      <pre>status: {{ state.status }}</pre>
      <pre>error: {{ state.error }}</pre>
    </slot>
  </div>
</template>

<script>
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { isVue3 } from '../util/vue-compat';

export default {
  name: 'AisStateResults',
  mixins: [
    createWidgetMixin({ connector: true }),
    createSuitMixin({ name: 'StateResults' }),
  ],
  props: {
    catchError: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      renderFn: () => {
        const { status, error } = this.instantSearchInstance;
        const results = this.getParentIndex().getResults();
        const helper = this.getParentIndex().getHelper();
        const state = helper ? helper.state : null;

        this.state = {
          results,
          state,
          status,
          error,
        };
      },
    };
  },
  created() {
    this.instantSearchInstance.addListener('render', this.renderFn);
    this.renderFn();
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    if (this.widget) {
      this.instantSearchInstance.removeListener('render', this.renderFn);
      if (this.errorFn) {
        this.instantSearchInstance.removeListener('error', this.errorFn);
      }
    }
  },
  watch: {
    catchError: {
      immediate: true,
      handler(catchError) {
        if (catchError) {
          this.errorFn = () => {};
          this.instantSearchInstance.addListener('error', this.errorFn);
        } else if (this.errorFn) {
          this.instantSearchInstance.removeListener('error', this.errorFn);
          this.errorFn = undefined;
        }
      },
    },
  },
};
</script>
