import suit from './suit';

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
    this.widgetFactory = this.connector(this.updateData, () => {});
    this.widget = this.widgetFactory(this.widgetParams);
    this.instantSearchInstance.addWidget(this.widget);
  },
  beforeDestroy() {
    this.instantSearchInstance.removeWidget(this.widget);
  },
  watch: {
    widgetParams(newVal) {
      const oldWidget = this.widget;
      this.widget = this.widgetFactory(newVal);
      this.instantSearchInstance.addWidget(this.widget);
      this.instantSearchInstance.removeWidget(oldWidget);
    },
  },
  methods: {
    suit(...args) {
      return suit(this.widgetName, ...args);
    },
    updateData(state = {}) {
      this.state = state;
    },
  },
};
