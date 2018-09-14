<template>
  <div
    :class="suit()"
    v-if="state && state.results"
  >
    <slot v-bind="state.results">
      <p>Use this component to have a different layout based on a certain state.</p>
      <p>Fill in the slot, and get access to the following things on the <code>slot-scope</code>:</p>
      <pre>{{ Object.keys(state.results) }}</pre>
    </slot>
  </div>
</template>

<script>
import algoliaComponent from '../mixins/component';

const connectStateResults = (renderFn, unmountFn) => (widgetParams = {}) => ({
  init({ instantSearchInstance }) {
    renderFn(
      {
        results: undefined,
        instantSearchInstance,
        widgetParams,
      },
      true
    );
  },

  render({ results, instantSearchInstance }) {
    const resultsCopy = Object.assign({}, results);
    // delete internal state, not to be exposed
    delete resultsCopy._state;
    renderFn(
      {
        results: resultsCopy,
        instantSearchInstance,
        widgetParams,
      },
      false
    );
  },

  dispose() {
    unmountFn();
  },
});

export default {
  mixins: [algoliaComponent],
  beforeCreate() {
    this.connector = connectStateResults;
  },
  data() {
    return {
      widgetName: 'SearchState',
    };
  },
};
</script>
