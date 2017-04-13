<template>
  <input type="search"
         autocorrect="off"
         autocapitalize="off"
         autocomplete="off"
         spellcheck="false"
         :class="bem()"
         v-model="query"
  >
</template>

<script>
import algoliaComponent from 'vue-instantsearch-component';

export default {
  mixins: [algoliaComponent],
  data() {
    return {
      blockClassName: 'ais-input'
    };
  },
  computed: {
    query: {
      get() {
        return this.searchStore.query;
      },
      set(value) {
        this.searchStore.stop();
        this.searchStore.query = value;
        this.$emit('query', value);

        // We here ensure we give the time to listeners to alter the store's state
        // without triggering in between ghost queries.
        this.$nextTick(function() {
          this.searchStore.start();
        });
      }
    }
  }
};
</script>
