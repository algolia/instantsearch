<template>
  <form role="search" action="" @submit.prevent="onFormSubmit">
    <slot>
      <ais-input :search-store="searchStore" :placeholder="placeholder" :autofocus="autofocus"></ais-input>
      <div v-if="showLoadingIndicator" :hidden="!searchStore.isSearchStalled" :class="bem('loading-indicator')" >
        <slot name="loading-indicator" >
          <svg width="1em" height="1em" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#000">
            <g fill="none" fill-rule="evenodd">
              <g transform="translate(1 1)" stroke-width="2">
                <circle stroke-opacity=".5" cx="18" cy="18" r="18"/>
                <path d="M36 18c0-9.94-8.06-18-18-18">
                  <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="1s"
                  repeatCount="indefinite"/>
                </path>
              </g>
            </g>
          </svg>
        </slot>
      </div>
      <button type="submit" :class="bem('submit')" :hidden="showLoadingIndicator && searchStore.isSearchStalled">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 40 40">
          <title>{{ submitTitle }}</title>
          <path
            d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"
            fillRule="evenodd"
          />
        </svg>
      </button>
      <ais-clear :search-store="searchStore">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20">
          <title>{{ clearTitle }}</title>
          <path
            d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"
            fillRule="evenodd"
          />
        </svg>
      </ais-clear>
    </slot>
  </form>
</template>

<script>
import algoliaComponent from '../component';
import AisInput from './Input.vue';
import AisClear from './Clear.vue';

export default {
  mixins: [algoliaComponent],
  props: {
    placeholder: {
      type: String,
      default: '',
    },
    submitTitle: {
      type: String,
      default: 'search',
    },
    clearTitle: {
      type: String,
      default: 'clear',
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    showLoadingIndicator: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      blockClassName: 'ais-search-box',
    };
  },
  methods: {
    onFormSubmit() {
      const input = this.$el.querySelector('input[type=search]');
      input.blur();
    },
  },
  components: {
    AisInput,
    AisClear,
  },
};
</script>
