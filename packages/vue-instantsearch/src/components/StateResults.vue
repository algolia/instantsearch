<template>
  <div
    :class="suit()"
    v-if="state && state.state && state.results"
  >
    <slot v-bind="stateResults">
      <p>
        Use this component to have a different layout based on a certain state.
      </p>
      <p>
        Fill in the slot, and get access to the following things on the
        <code>slot-scope</code>:
      </p>
      <pre>results: {{ Object.keys(state.results) }}</pre>
      <pre>state: {{ Object.keys(state.state) }}</pre>
    </slot>
  </div>
</template>

<script>
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { _objectSpread } from '../util/polyfills';
import connectStateResults from '../connectors/connectStateResults';

export default {
  name: 'AisStateResults',
  mixins: [
    createWidgetMixin({ connector: connectStateResults }),
    createSuitMixin({ name: 'StateResults' }),
  ],
  computed: {
    stateResults() {
      // @MAJOR: replace v-bind="stateResults" with :state="state.state" :results="state.results"
      const { state, results } = this.state;
      return _objectSpread({}, results, { results, state });
    },
  },
};
</script>
