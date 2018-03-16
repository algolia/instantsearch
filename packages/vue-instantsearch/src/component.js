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
      this._instance.addWidget(this.widget);
    }
  },
  beforeDestroy() {
    // todo: remove dispose flub
    if (this.widget && this.widget.dispose) {
      this._instance.removeWidget(this.widget);
    }
  },
  watch: {
    widgetParams(newVal) {
      if (this.widget) {
        const oldWidget = this.widget;
        this.widget = this.widgetFactory(newVal);

        this._instance.addWidget(this.widget);
        // todo: remove dispose flub
        if (oldWidget.dispose) {
          this._instance.removeWidget(oldWidget);
        }
      }
    },
  },
  methods: {
    bem(element, modifier, outputElement) {
      if (!this.blockClassName) {
        throw new Error("You need to provide 'blockClassName' in your data.");
      }

      const blockClassName = this.blockClassName;
      if (!element && !modifier) {
        return this.customClassName(blockClassName);
      }

      if (!element) {
        const blockModifierClassName = `${blockClassName}--${modifier}`;

        return this.customClassName(blockModifierClassName);
      }

      const elementClassName = `${blockClassName}__${element}`;
      if (!modifier) {
        return this.customClassName(elementClassName);
      }

      const elementModifierClassName = `${elementClassName}--${modifier}`;

      if (outputElement !== undefined && outputElement === false) {
        return this.customClassName(elementModifierClassName);
      }
      return `${this.customClassName(elementClassName)} ${this.customClassName(
        elementModifierClassName
      )}`;
    },
    updateData(state = {}) {
      this.state = state;
    },
    customClassName(className) {
      return !this.classNames[className]
        ? className
        : this.classNames[className];
    },
  },
};
