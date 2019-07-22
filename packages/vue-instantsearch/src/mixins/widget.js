import { warn } from '../util/warn';

export const createWidgetMixin = ({ connector } = {}) => ({
  inject: {
    instantSearchInstance: {
      name: 'instantSearchInstance',
      default() {
        const tag = this.$options._componentTag;
        throw new TypeError(
          `It looks like you forgot to wrap your Algolia search component "<${tag}>" inside of an "<ais-instant-search>" component.`
        );
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
      this.widget = this.factory(this.widgetParams);
      this.instantSearchInstance.addWidget(this.widget);

      const { hydrated, started } = this.instantSearchInstance;
      if ((!started && hydrated) || this.$isServer) {
        if (typeof this.instantSearchInstance.__forceRender !== 'function') {
          throw new Error(
            'You are using server side rendering with <ais-instant-search> instead of <ais-instant-search-ssr>.'
          );
        }
        this.instantSearchInstance.__forceRender(this.widget);
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
  beforeDestroy() {
    if (
      this.widget &&
      this.widget.dispose &&
      this.instantSearchInstance.started // a widget can't be removed if IS is not started
    ) {
      this.instantSearchInstance.removeWidget(this.widget);
    }
  },
  watch: {
    widgetParams: {
      handler(nextWidgetParams) {
        this.state = null;
        // a widget can't be removed if IS is not started
        if (this.widget.dispose && this.instantSearchInstance.started) {
          this.instantSearchInstance.removeWidget(this.widget);
        }
        this.widget = this.factory(nextWidgetParams);
        this.instantSearchInstance.addWidget(this.widget);
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
