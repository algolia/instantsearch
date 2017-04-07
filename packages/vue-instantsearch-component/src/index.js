export default {
  inject: ['_searchStore'],
  props: {
    searchStore: {
      type: Object,
      default () {
        return this._searchStore
      },
      validator (value) {
        if (typeof value !== 'object') {
          throw 'It looks like you forgot to wrap your Algolia search component inside of an <search-store> component. You can also pass the store as a prop to your component.'
        }

        return true
      }
    },
    classNames: {
      type: Object,
      default () {
        return {}
      }
    },
  },
  methods: {
    bem (element, modifier) {
      if(!this.blockClassName) {
        throw new Error('You need to provide \'blockClassName\' in your data.')
      }

      const blockClassName = this.blockClassName
      if(!element && !modifier) {
        return this.customClassName(blockClassName)
      }

      if(!element) {
        const blockModifierClassName = blockClassName + '--' + modifier

        return this.customClassName(blockModifierClassName)
      }

      const elementClassName = blockClassName + '__' + element
      if (!modifier) {
        return this.customClassName(elementClassName)
      }

      const elementModifierClassName = elementClassName + '--' + modifier

      return this.customClassName(elementClassName) + ' ' + this.customClassName(elementModifierClassName)
    },
    customClassName (className) {
      return !this.classNames[className] ? className : this.classNames[className]
    }
  }
}
