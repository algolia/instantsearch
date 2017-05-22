<template>
  <div :class="bem()">
    <slot></slot>
  </div>
</template>

<script>
import { createFromAlgoliaCredentials } from '../store';
import algoliaComponent from '../component';

export default {
  mixins: [algoliaComponent],
  props: {
    apiKey: {
      type: String,
      default() {
        // Todo: add validator callback in case no search store is injected
        if (this._searchStore) {
          return this._searchStore.algoliaApiKey;
        }

        return;
      },
    },
    appId: {
      type: String,
      default() {
        // Todo: add validator callback in case no search store is injected
        if (this._searchStore) {
          return this._searchStore.algoliaAppId;
        }

        return;
      },
    },
    indexName: {
      type: String,
      default() {
        // Todo: add validator callback in case no search store is injected
        if (this._searchStore) {
          return this._searchStore.indexName;
        }

        return;
      },
    },
    query: {
      type: String,
      default: '',
    },
    queryParameters: {
      type: Object,
    },
  },
  data() {
    return {
      blockClassName: 'ais-index',
    };
  },
  provide() {
    if (!this.searchStore) {
      this._localSearchStore = createFromAlgoliaCredentials(
        this.appId,
        this.apiKey
      );
    } else {
      this._localSearchStore = this.searchStore;
      // Todo: check if is started and stop it.
    }

    if (this.indexName) {
      this._localSearchStore.indexName = this.indexName;
    }

    if (this.query) {
      this._localSearchStore.query = this.query;
    }

    if (this.queryParameters) {
      this._localSearchStore.queryParameters = this.queryParameters;
    }

    return {
      _searchStore: this._localSearchStore,
    };
  },
  mounted() {
    this._localSearchStore.start();
  },
  watch: {
    indexName() {
      this._localSearchStore.indexName = this.indexName;
    },
    query() {
      this._localSearchStore.query = this.query;
    },
    queryParameters() {
      this._localSearchStore.queryParameters = this.queryParameters;
    },
  },
};
</script>
