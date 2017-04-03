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
    }
  }
}

