<template>
  <div>search</div>
</template>

<script>
import { connectSearchBox } from 'instantsearch.js/es/connectors';
import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  props: {

  },
  data() {
    return {
      widgetName: 'SearchBox',
    };
  },
  beforeCreate() {
    this.connector = connectSearchBox;
  },
  methods: {
    onFormSubmit() {
      const input = this.$el.querySelector('input[type=search]');
      input.blur();
    },
  },
};</script>
