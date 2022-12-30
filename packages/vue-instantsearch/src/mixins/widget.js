import { _objectSpread } from '../util/polyfills';
import { isVue3 } from '../util/vue-compat';
import { warn } from '../util/warn';

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
      this.factory = connector(this.updateState, () => {});
      this.widget = _objectSpread(
        this.factory(this.widgetParams),
        additionalProperties
      );
      this.getParentIndex().addWidgets([this.widget]);

      if (
        this.instantSearchInstance._initialResults &&
        !this.instantSearchInstance.started
      ) {
        if (typeof this.instantSearchInstance.__forceRender !== 'function') {
          throw new Error(
            'You are using server side rendering with <ais-instant-search> instead of <ais-instant-search-ssr>.'
          );
        }
        this.instantSearchInstance.__forceRender(
          this.widget,
          this.getParentIndex()
        );
      }
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
    if (this.widget) {
      this.getParentIndex().removeWidgets([this.widget]);
    }
  },
  watch: {
    widgetParams: {
      handler(nextWidgetParams) {
        this.state = null;
        this.getParentIndex().removeWidgets([this.widget]);
        this.widget = _objectSpread(
          this.factory(nextWidgetParams),
          additionalProperties
        );
        this.getParentIndex().addWidgets([this.widget]);
      },
      deep: true,
    },
  },
  methods: {
    updateState(state = {}, isFirstRender) {
      if (!isFirstRender) {
        // Avoid updating the state on first render
        // otherwise there will be a flash of placeholder data
        this.state = state;
      }
    },
  },
});
