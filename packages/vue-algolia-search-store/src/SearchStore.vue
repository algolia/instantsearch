<template>
  <div class="alg-search-store">
    <slot></slot>
  </div>
</template>

<script>
  import {createFromAlgoliaCredentials} from 'algolia-search-store'

  export default {
    inject: ['_searchStore'],
    props: {
      apiKey: {
        type: String,
        default () {
          // Todo: add validator callback in case no search store is injected
          if (this._searchStore) {
            return this._searchStore.algoliaApiKey
          }

          return
        }
      },
      appId: {
        type: String,
        default () {
          // Todo: add validator callback in case no search store is injected
          if (this._searchStore) {
            return this._searchStore.algoliaAppId
          }

          return
        }
      },
      index: {
        type: String,
        default () {
          // Todo: add validator callback in case no search store is injected
          if (this._searchStore) {
            return this._searchStore.index
          }

          return
        }
      }
    },
    provide () {
      this._localSearchStore = createFromAlgoliaCredentials(this.appId, this.apiKey)
      if (this.index) {
        this._localSearchStore.index = this.index
      }
      // Todo: add user agent

      return {
        _searchStore: this._localSearchStore
      }
    },
    mounted () {
      this._localSearchStore.start()
    },
    watch: {
      index () {
        this._localSearchStore.index = this.index
      }
    }
  }
</script>
