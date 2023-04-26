<template>
  <ais-instant-search-ssr>
    <ais-index
      index-name="instant_search_demo_query_suggestions"
      index-id="querySuggestions"
    >
      <ais-search-box />
      <ais-configure :hits-per-page.camel="5" />
      <ais-hits>
        <template #item="{ item }">
          <ais-highlight attribute="query" :hit="item" />
        </template>
      </ais-hits>
      <ais-pagination />
    </ais-index>
    <ais-search-box />
    <ais-stats />
    <ais-index index-id="refinement" index-name="instant_search">
      <ais-refinement-list attribute="brand" />
    </ais-index>
    <ais-hits>
      <template #item="{ item }">
        <p>
          <ais-highlight attribute="name" :hit="item" />
        </p>
        <p>
          <ais-highlight attribute="brand" :hit="item" />
        </p>
      </template>
    </ais-hits>
    <ais-pagination />
  </ais-instant-search-ssr>
</template>

<script>
import {
  AisInstantSearchSsr,
  AisIndex,
  AisConfigure,
  AisRefinementList,
  AisHits,
  AisHighlight,
  AisSearchBox,
  AisStats,
  AisPagination,
  createServerRootMixin,
} from 'vue-instantsearch';
import algoliasearch from 'algoliasearch/lite';
import _renderToString from 'vue-server-renderer/basic';

function renderToString(app) {
  return new Promise((resolve, reject) => {
    _renderToString(app, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

export default {
  mixins: [
    createServerRootMixin({
      searchClient,
      indexName: 'instant_search',
      insights: true,
      initialUiState: {
        // eslint-disable-next-line camelcase
        instant_search: {
          query: 'iphone',
          page: 3,
        },
        refinement: {
          refinementList: {
            brand: ['Apple'],
          },
        },
        querySuggestions: {
          query: 'k',
          page: 2,
          configure: {
            hitsPerPage: 5,
          },
        },
      },
    }),
  ],
  serverPrefetch() {
    return this.instantsearch
      .findResultsState({ component: this, renderToString })
      .then((algoliaState) => {
        this.$ssrContext.nuxt.algoliaState = algoliaState;
      });
  },
  beforeMount() {
    const results = window.__NUXT__.algoliaState;

    this.instantsearch.hydrate(results);
  },
  components: {
    AisInstantSearchSsr,
    AisIndex,
    AisConfigure,
    AisRefinementList,
    AisHits,
    AisHighlight,
    AisSearchBox,
    AisStats,
    AisPagination,
  },
  head() {
    return {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://unpkg.com/instantsearch.css@7.1.0/themes/algolia-min.css',
        },
      ],
    };
  },
};
</script>

<style>
.ais-Hits-list {
  text-align: left;
}
.ais-Hits-list:empty {
  margin: 0;
}
.ais-InstantSearch {
  margin: 1em;
}
</style>
