<template>
  <div v-if="state" :class="suit()">
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
        ref="searchInput"
      >
        <template #loading-indicator v-if="isVue3">
          <slot name="loading-indicator" />
        </template>
        <slot v-if="isVue2" name="loading-indicator" slot="loading-indicator" />

        <template #submit-icon v-if="isVue3">
          <slot name="submit-icon" />
        </template>
        <slot v-if="isVue2" name="submit-icon" slot="submit-icon" />

        <template #reset-icon v-if="isVue3">
          <slot name="reset-icon" />
        </template>
        <slot v-if="isVue2" name="reset-icon" slot="reset-icon" />
      </search-input>
    </slot>
  </div>
</template>

<script>
import { connectSearchBox } from 'instantsearch.js/es/connectors';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { isVue3, isVue2 } from '../util/vue-compat';
import SearchInput from './SearchInput.vue';

export default {
  name: 'AisSearchBox',
  mixins: [
    createWidgetMixin(
      {
        connector: connectSearchBox,
      },
      {
        $$widgetType: 'ais.searchBox',
      }
    ),
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
    modelValue: {
      type: String,
      default: undefined,
    },
    queryHook: {
      type: Function,
      default: undefined,
    },
  },
  data() {
    return {
      localValue: '',
      isVue2,
      isVue3,
    };
  },
  computed: {
    widgetParams() {
      return {
        queryHook: this.queryHook,
      };
    },
    isControlled() {
      return (
        typeof this.value !== 'undefined' ||
        typeof this.modelValue !== 'undefined'
      );
    },
    model() {
      return this.value || this.modelValue;
    },
    currentRefinement: {
      get() {
        // if the input is controlled, but not up to date
        // this means it didn't search, and we should pretend it was `set`
        if (this.isControlled && this.model !== this.localValue) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.localValue = this.model;
          this.$emit('input', this.model);
          this.$emit('update:modelValue', this.model);
          this.state.refine(this.model);
        }

        // we return the local value if the input is focused to avoid
        // concurrent updates when typing
        const { searchInput } = this.$refs;
        if (searchInput && searchInput.isFocused()) {
          return this.localValue;
        }

        return this.model || this.state.query || '';
      },
      set(val) {
        this.localValue = val;
        this.state.refine(val);
        if (this.isControlled) {
          this.$emit('input', val);
          this.$emit('update:modelValue', val);
        }
      },
    },
  },
};
</script>
