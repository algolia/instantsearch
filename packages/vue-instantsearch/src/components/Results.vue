<template>
  <div :class="bem()">

    <slot name="header"></slot>

    <slot v-for="(result, index) in results" :result="result" :index="index">
      {{index}}: Result 'objectID': {{ result.objectID }}
    </slot>

    <slot name="footer"></slot>

  </div>
</template>

<script>
import algoliaComponent from '../component';
import { connectHits } from 'instantsearch.js/es/connectors';

export default {
  mixins: [algoliaComponent],
  props: {
    escapeHits: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      blockClassName: 'ais-results',
      widget: undefined,
      state: {},
    };
  },
  created() {
    this.widget = connectHits(this.updateData);

    this._instance.addWidget(
      this.widget({
        escapeHits: this.escapeHits,
      })
    );
  },
  methods: {
    updateData(state = {}, isFirstRendering) {
      this.state = state;
    },
  },
  computed: {
    results() {
      return this.state.hits;
    },
  },
};
</script>
