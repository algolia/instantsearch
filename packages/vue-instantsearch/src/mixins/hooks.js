import { createHooksStore } from '../util/hooks';
import { isVue3 } from '../util/vue-compat';

/**
 * Gives a component its own React-style hooks store (`util/hooks.js`), driven
 * by the component's render cycle: effects flush after mount/update and clean
 * up when the component goes away.
 *
 * In `render`, wrap the hook calls (and the shared components that make them)
 * with `this.hooksStore.beginRender()` / `endRender()`, and create the shared
 * components through `this.getUiComponent(key, create)`.
 */
export const createHooksMixin = () => ({
  created() {
    this.hooksStore = createHooksStore(() => this.$forceUpdate());
    this.uiComponents = {};
  },
  methods: {
    /**
     * Creates a shared `instantsearch-ui-components` component once per
     * instance. The factories can hold state across renders (refs, element
     * bookkeeping), so they can't be re-run on every render. The React-style
     * `createElement` they capture is stable for the instance's lifetime.
     */
    getUiComponent(key, create) {
      if (!this.uiComponents[key]) {
        this.uiComponents[key] = create();
      }
      return this.uiComponents[key];
    },
  },
  mounted() {
    this.hooksStore.flushEffects();
  },
  updated() {
    this.hooksStore.flushEffects();
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    this.hooksStore.cleanup();
  },
});
