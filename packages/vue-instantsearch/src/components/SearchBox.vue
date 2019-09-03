<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :current-refinement="currentRefinement"
      :is-search-stalled="state.isSearchStalled"
      :refine="state.refine"
    >
      <search-input
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
        @reset="$emit('reset')"
        :placeholder="placeholder"
        :autofocus="autofocus"
        :show-loading-indicator="showLoadingIndicator"
        :should-show-loading-indicator="state.isSearchStalled"
        :submit-title="submitTitle"
        :reset-title="resetTitle"
        :class-names="classNames"
        v-model="currentRefinement"
      >
        <slot
          name="loading-indicator"
          slot="loading-indicator"
        />
        <slot
          name="submit-icon"
          slot="submit-icon"
        />
        <slot
          name="reset-icon"
          slot="reset-icon"
        />
      </search-input>
    </slot>
  </div>
</template>

<script>
import { connectSearchBox } from 'instantsearch.js/es/connectors';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import SearchInput from './SearchInput.vue';

export default {
  name: 'AisSearchBox',
  mixins: [
    createWidgetMixin({ connector: connectSearchBox }),
    createSuitMixin({ name: 'SearchBox' }),
  ],
  components: {
    SearchInput,
  },
  props: {
    placeholder: {
      type: String,
      default: 'Search here…',
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    showLoadingIndicator: {
      type: Boolean,
      default: false,
    },
    submitTitle: {
      type: String,
      default: 'Search',
    },
    resetTitle: {
      type: String,
      default: 'Clear',
    },
    value: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      localValue: '',
    };
  },
  methods: {
    onFormSubmit() {
      const input = this.$el.querySelector('input[type=search]');
      input.blur();
    },
    onFormReset() {
      this.state.refine('');
    },
  },
  computed: {
    isControlled() {
      return typeof this.value !== 'undefined';
    },
    currentRefinement: {
      get() {
        // if the input is controlled, but not up to date
        // this means it didn't search, and we should pretend it was `set`
        if (this.isControlled && this.value !== this.localValue) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.localValue = this.value;
          this.$emit('input', this.value);
          this.state.refine(this.value);
        }
        return this.value || this.state.query || '';
      },
      set(val) {
        this.localValue = val;
        this.state.refine(val);
        if (this.isControlled) {
          this.$emit('input', val);
        }
      },
    },
  },
};
</script>
