import suit from '../util/suit';

export default {
  inject: {
    instantSearchInstance: {
      name: 'instantSearchInstance',
      default() {
        const tag = this.$options._componentTag;
        throw new TypeError(
          `It looks like you forgot to wrap your Algolia search component
          "<${tag}>" inside of an "<ais-index>" component.`
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
    if (this.connector) {
      this.factory = this.connector(this.updateState, () => {});
      this.widget = this.factory(this.widgetParams);
      this.instantSearchInstance.addWidget(this.widget);
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
    suit(...args) {
      return suit(this.widgetName, ...args);
    },
    updateState(state = {}, isFirstRender) {
      if (!isFirstRender) {
        // Avoid updating the state on first render
        // otherwise there will be a flash of placeholder data
        this.state = state;
      }
    },
  },
};
