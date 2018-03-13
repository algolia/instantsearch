<template>
</template>

<script>
import algoliaComponent from '../component';
import { configure } from 'instantsearch.js/es/widgets';

export default {
  mixins: [algoliaComponent],
  beforeCreate() {
    this.widgetFactory = configure;
  },
  computed: {
    widgetParams() {
      const mixinProps = Object.keys(algoliaComponent.props); // classNames, instance, searchStore

      /* eslint-disable no-continue */
      const params = {};
      for (const i in this.$attrs) {
        if (mixinProps.indexOf(i) >= 0) continue;
        if (!Object.prototype.hasOwnProperty.call(this.$attrs, i)) continue;
        params[i] = this.$attrs[i];
      }
      /* eslint-enable no-continue */

      return params;
    },
  },
};</script>
