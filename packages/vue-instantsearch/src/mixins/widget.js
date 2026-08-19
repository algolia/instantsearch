import { isVue3 } from '../util/vue-compat';
import { warn } from '../util/warn';
import { createWidgetLifecycleController } from '../util/widgetLifecycleController';

export const createWidgetMixin = (
  { connector } = {},
  additionalProperties = {}
) => ({
  inject: {
    instantSearchInstance: {
      from: '$_ais_instantSearchInstance',
      default() {
        const tag = this.$options._componentTag;
        throw new TypeError(
          `It looks like you forgot to wrap your Algolia search component "<${tag}>" inside of an "<ais-instant-search>" component.`
        );
      },
    },
    getParentIndex: {
      from: '$_ais_getParentIndex',
      default() {
        return () => this.instantSearchInstance.mainIndex;
      },
    },
  },
  data() {
    return {
      state: null,
    };
  },
  created() {
    if (typeof connector === 'function') {
      this.lifecycle = createWidgetLifecycleController({
        connector,
        additionalWidgetProperties: additionalProperties,
        instantSearchInstance: this.instantSearchInstance,
        getParentIndex: this.getParentIndex,
        renderCallback: this.updateState,
        // `this.widget` must be set before `addWidgets`: on a started
        // instance `init` runs synchronously and `updateState` reads it.
        onWidgetCreated: (widget) => {
          this.widget = widget;
        },
      });
      this.lifecycle.mount(this.widgetParams);
    } else if (connector !== true) {
      warn(
        `You are using the InstantSearch widget mixin, but didn't provide a connector.
While this is technically possible, and will give you access to the Helper,
it's not the recommended way of making custom components.

If you want to disable this message, pass { connector: true } to the mixin.

Read more on using connectors: https://alg.li/vue-custom`
      );
    }
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    if (this.lifecycle) {
      this.lifecycle.unmount();
    }
  },
  watch: {
    widgetParams: {
      handler(nextWidgetParams) {
        this.state = null;
        this.lifecycle.update(nextWidgetParams);
      },
      deep: true,
    },
  },
  methods: {
    updateState(state = {}, isFirstRender) {
      // Search-backed widgets skip placeholder state from init. Request-free
      // widgets may not receive another render, so their init state is final.
      if (!isFirstRender || this.widget.dependsOn === 'none') {
        this.state = state;
      }
    },
  },
});
