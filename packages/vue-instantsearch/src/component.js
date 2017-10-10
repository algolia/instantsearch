export default {
  inject: ['_searchStore'],
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
    classNames: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  beforeCreate() {
    let source = this; // eslint-disable-line consistent-this
    const provideKey = '_searchStore';

    while (source) {
      if (source._provided && provideKey in source._provided) {
        break;
      }
      source = source.$parent;
    }

    if (!source) {
      if (!this._provided) {
        this._provided = {};
      }

      this._provided[provideKey] = undefined;
    }
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
    customClassName(className) {
      return !this.classNames[className]
        ? className
        : this.classNames[className];
    },
  },
};
