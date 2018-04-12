export default {
  inject: ['_searchStore', '_instance'],
  props: {
    searchStore: {
      type: Object,
      default() {
        if (typeof this._searchStore !== 'object') {
          const tag = this.$options._componentTag;
          throw new TypeError(
            `It looks like you forgot to wrap your Algolia search component 
            "<${tag}>" inside of an "<ais-index>" component. You can also pass a 
            search store as a prop to your component.`
          );
        }
        return this._searchStore;
      },
    },
    instance: {
      type: Object,
      default() {
        if (typeof this._instance !== 'object') {
          const tag = this.$options._componentTag;
          throw new TypeError(
            `It looks like you forgot to wrap your Algolia search component 
            "<${tag}>" inside of an "<ais-index>" component. You can also pass a 
            search store as a prop to your component.`
          );
        }
        return this._instance;
      },
    },
    classNames: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      state: {},
    };
  },
  beforeCreate() {
    let source = this; // eslint-disable-line consistent-this
    const store = '_searchStore';
    const instance = '_instance';

    while (source) {
      if (source._provided && store in source._provided) {
        break;
      }
      if (source._provided && instance in source._provided) {
        break;
      }
      source = source.$parent;
    }

    if (!source) {
      if (!this._provided) {
        this._provided = {};
      }

      this._provided[store] = undefined;
      this._provided[instance] = undefined;
    }
  },
  created() {
    if (this.connector) {
      this.widgetFactory = this.connector(this.updateData, () => {});
    }
    if (this.widgetFactory) {
      this.widget = this.widgetFactory(this.widgetParams);
      this.instance.addWidget(this.widget);
    }
  },
  beforeDestroy() {
    // todo: remove dispose flub
    if (this.widget && this.widget.dispose) {
      this.instance.removeWidget(this.widget);
    }
  },
  watch: {
    widgetParams(newVal) {
      if (this.widget) {
        const oldWidget = this.widget;
        this.widget = this.widgetFactory(newVal);

        this.instance.addWidget(this.widget);
        // todo: remove dispose flub
        if (oldWidget.dispose) {
          this.instance.removeWidget(oldWidget);
        }
      }
    },
  },
  methods: {
    bem(element, subElement) {
      if (!this.widgetName) {
        throw new Error('You need to provide `widgetName` in your data');
      }

      if (element) {
        const scoppedWidgetName = `ais-${this.widgetName}-${element}`;
        // output `ais-Widget-Xyz--abc`
        if (subElement) return `${scoppedWidgetName}--${subElement}`;
        // output `ais-Widget-Xyz`
        return scoppedWidgetName;
      } else {
        // output `ais-Widget`
        return `ais-${this.widgetName}`;
      }
    },
    updateData(state = {}) {
      this.state = state;
    },
  },
};
