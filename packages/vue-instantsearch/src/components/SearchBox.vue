<script>
import { connectSearchBox } from 'instantsearch-core';
import { createSearchBoxComponent } from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { getSearchBoxClassNames } from '../util/searchBoxClassNames';
import { Fragment, getScopedSlot, renderReactCompat } from '../util/vue-compat';

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
  props: {
    placeholder: {
      type: String,
      default: '',
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    showLoadingIndicator: {
      type: Boolean,
      default: true,
    },
    ignoreCompositionEvents: {
      type: Boolean,
      default: false,
    },
    submitTitle: {
      type: String,
      default: 'Submit the search query',
    },
    resetTitle: {
      type: String,
      default: 'Clear the search query',
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
  created() {
    this.inputRef = { current: null };
  },
  data() {
    return {
      localValue: '',
      isSearchStalled: false,
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
        if (
          this.inputRef.current &&
          document.activeElement === this.inputRef.current
        ) {
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
  methods: {
    onInput(event) {
      if (!(this.ignoreCompositionEvents && event.isComposing)) {
        this.currentRefinement = event.target.value;
      }
    },
  },
  watch: {
    // `status` is snapshotted when the connector renders, like the rest of
    // `state`. Reading it in the template would subscribe to the (reactive)
    // instance and re-render on every status change, e.g. mid-composition.
    state: {
      immediate: true,
      handler() {
        this.isSearchStalled = this.instantSearchInstance.status === 'stalled';
      },
    },
  },
  render: renderReactCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const defaultSlot = getScopedSlot(this, 'default');
    if (defaultSlot) {
      return h('div', { className: this.suit() }, [
        defaultSlot({
          currentRefinement: this.currentRefinement,
          isSearchStalled: this.isSearchStalled,
          refine: this.state.refine,
        }),
      ]);
    }

    const submitIconSlot = getScopedSlot(this, 'submit-icon');
    const resetIconSlot = getScopedSlot(this, 'reset-icon');
    const loadingIndicatorSlot = getScopedSlot(this, 'loading-indicator');

    const SearchBox = createSearchBoxComponent({
      createElement: h,
      Fragment,
    });

    return h(SearchBox, {
      value: this.currentRefinement,
      placeholder: this.placeholder,
      autoFocus: this.autofocus,
      isSearchStalled: this.isSearchStalled,
      showLoadingIndicator: this.showLoadingIndicator,
      inputRef: this.inputRef,
      inputProps: {
        onInput: this.onInput,
        onCompositionEnd: this.onInput,
        onFocus: (event) => this.$emit('focus', event),
        onBlur: (event) => this.$emit('blur', event),
      },
      onReset: () => {
        this.currentRefinement = '';
        this.$emit('reset');
      },
      submitIconComponent: submitIconSlot && (() => submitIconSlot()),
      resetIconComponent: resetIconSlot && (() => resetIconSlot()),
      loadingIconComponent:
        loadingIndicatorSlot && (() => loadingIndicatorSlot()),
      classNames: getSearchBoxClassNames(this.classNames),
      translations: {
        submitButtonTitle: this.submitTitle,
        resetButtonTitle: this.resetTitle,
      },
    });
  }),
};
</script>
