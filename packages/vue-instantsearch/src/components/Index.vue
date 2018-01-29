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
    searchStore: {
      type: Object,
      default() {
        return this._searchStore;
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
      blockClassName: 'ais-index',
    };
  },
  provide() {
    if (!this.searchStore) {
      this._localSearchStore = createFromAlgoliaCredentials(
        this.appId,
        this.apiKey,
        { stalledSearchDelay: this.stalledSearchDelay }
      );
    } else {
      this._localSearchStore = this.searchStore;
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

    return {
      _searchStore: this._localSearchStore,
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
};
</script>
