<template>
  <div :class="suit()">
    <slot></slot>
  </div>
</template>

<script>
import { createFromAlgoliaCredentials } from '../store';
import algoliaComponent from '../component';
import instantsearch from 'instantsearch.js/es/';

export default {
  mixins: [algoliaComponent],
  props: {
    searchStore: {
      type: Object,
      default() {
        return this._searchStore;
      },
    },
    instance: {
      type: Object,
      default() {
        return this._localInstance;
      },
    },
    apiKey: {
      type: String,
      default() {
        if (this._searchStore) {
          return this._searchStore.algoliaApiKey;
        }

        return undefined;
      },
    },
    appId: {
      type: String,
      default() {
        if (this._searchStore) {
          return this._searchStore.algoliaAppId;
        }

        return undefined;
      },
    },
    indexName: {
      type: String,
      default() {
        if (this._searchStore) {
          return this._searchStore.indexName;
        }

        return undefined;
      },
    },
    query: {
      type: String,
      default: '',
    },
    queryParameters: {
      type: Object,
    },
    cache: {
      type: Boolean,
      default: true,
    },
    autoSearch: {
      type: Boolean,
      default: true,
    },
    stalledSearchDelay: {
      type: Number,
      default: 200,
    },
  },
  data() {
    return {
      widgetName: 'ais-index',
    };
  },
  provide() {
    if (this.searchStore) {
      this._localSearchStore = this.searchStore;
    } else {
      this._localSearchStore = createFromAlgoliaCredentials(
        this.appId,
        this.apiKey,
        { stalledSearchDelay: this.stalledSearchDelay }
      );
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

    if (this.cache) {
      this._localSearchStore.enableCache();
    } else {
      this._localSearchStore.disableCache();
    }

    // todo: make it configurable
    this._localInstance = instantsearch({
      // appId: this.appId,
      // apiKey: this.apiKey,
      // indexName: this.indexName,
      appId: 'latency',
      apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
      indexName: 'instant_search',
      searchParameters: {
        attributesToSnippet: ['description'],
      },
    });
    this._localInstance.start();

    return {
      _searchStore: this._localSearchStore,
      _instance: this._localInstance,
    };
  },
  mounted() {
    this._localSearchStore.start();
    if (this.autoSearch) {
      this._localSearchStore.refresh();
    }
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
};</script>
