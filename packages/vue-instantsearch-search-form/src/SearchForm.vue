<template>
  <form role="search" action="" @submit.prevent="onFormSubmit">
    <slot>
      <ais-input ref="input"></ais-input>
      <button type="submit" :class="bem('submit')">Search</button>
      <ais-clear />
    </slot>
  </form>
</template>

<script>
import algoliaComponent from 'vue-instantsearch-component';
import AisInput from 'vue-instantsearch-input';
import AisClear from 'vue-instantsearch-clear';

export default {
  mixins: [algoliaComponent],
  data() {
    return {
      blockClassName: 'ais-search-form'
    };
  },
  methods: {
    onFormSubmit() {
      const input = this.$el.querySelector('input[type=search]');
      input.blur();
    }
  },
  components: {
    AisInput,
    AisClear
  }
};
</script>
