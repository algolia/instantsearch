import { createSuitMixin } from '../mixins/suit';
import { getScopedSlot, renderCompat } from '../util/vue-compat';

import AutocompleteHeadless from './AutocompleteHeadless.vue';
import AutocompleteWidget from './AutocompleteWidget';

/**
 * `AisAutocomplete` dispatches between two implementations, so the rich
 * autocomplete widget is the default while the legacy headless slot API stays
 * backward-compatible:
 *
 * - When a default (scoped) slot is provided, it renders the legacy headless
 *   component unchanged — existing custom-rendering usages keep working with
 *   the same `{ refine, currentRefinement, indices }` slot props.
 * - Otherwise it renders the new rich Autocomplete widget (search box + panel +
 *   indices).
 *
 * The two can't be a single widget because they register different widget
 * graphs (the headless component wraps `connectAutocomplete` at the page
 * scope; the rich widget owns an isolated `<AisIndex>` subtree).
 */
export default {
  name: 'AisAutocomplete',
  mixins: [createSuitMixin({ name: 'Autocomplete' })],
  props: {
    // Legacy headless props
    escapeHTML: { type: Boolean, required: false, default: undefined },
    // Shared
    requiresSearch: { type: Boolean, required: false, default: undefined },
    // Rich widget props
    indices: { type: Array, required: false, default: undefined },
    showQuerySuggestions: {
      type: Object,
      required: false,
      default: undefined,
    },
    searchParameters: { type: Object, required: false, default: undefined },
    autofocus: { type: Boolean, required: false, default: undefined },
    placeholder: { type: String, required: false, default: undefined },
    transformItems: { type: Function, required: false, default: undefined },
  },
  computed: {
    hasDefaultSlot() {
      return Boolean(
        getScopedSlot(this, 'default') || (this.$slots && this.$slots.default)
      );
    },
    // Proxy the inner widget so widget introspection (and the conventions
    // test) can read it off `AisAutocomplete`.
    widget() {
      return this.$refs.inner && this.$refs.inner.widget;
    },
  },
  render: renderCompat(function (h) {
    if (this.hasDefaultSlot) {
      return h(AutocompleteHeadless, {
        props: {
          escapeHTML: this.escapeHTML,
          requiresSearch: this.requiresSearch,
        },
        // `$scopedSlots` is Vue 2; `$slots` is Vue 3. `renderCompat`'s `h`
        // normalizes the `scopedSlots` data into the right shape per version.
        scopedSlots: this.$scopedSlots || this.$slots,
        ref: 'inner',
      });
    }

    return h(AutocompleteWidget, {
      props: {
        indices: this.indices,
        showQuerySuggestions: this.showQuerySuggestions,
        searchParameters: this.searchParameters,
        requiresSearch: this.requiresSearch,
        autofocus: this.autofocus,
        placeholder: this.placeholder,
        transformItems: this.transformItems,
        classNames: this.classNames,
      },
      ref: 'inner',
    });
  }),
};
