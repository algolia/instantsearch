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
      indexName: {
        type: String,
        default () {
          // Todo: add validator callback in case no search store is injected
          if (this._searchStore) {
            return this._searchStore.indexName
          }

          return
        }
      },
      query: {
        type: String,
        default: ""
      }
    },
    provide () {
      this._localSearchStore = createFromAlgoliaCredentials(this.appId, this.apiKey)
      if (this.indexName) {
        this._localSearchStore.indexName = this.indexName
      }

      if(this.query) {
        this._localSearchStore.query = this.query
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
      indexName () {
        this._localSearchStore.index = this.indexName
      },
      query () {
        this._localSearchStore.query = this.query
      }
    }
  }
</script>
