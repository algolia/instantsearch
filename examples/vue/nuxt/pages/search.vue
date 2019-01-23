<template>
  <ais-instant-search-ssr>
    <ais-search-box />
    <ais-stats />
    <ais-refinement-list attribute="genre" />
    <ais-hits>
      <template
        slot="item"
        slot-scope="{ item }"
      >
        <ais-highlight
          attribute="title"
          :hit="item"
        />
        <p class="year">{{ item.year }}</p>
        <p class="genre">
          <span
            v-for="genre in item.genre"
            :key="genre"
            class="badge"
          >
            {{ genre }}
          </span>
        </p>
      </template>
    </ais-hits>
    <ais-pagination />
  </ais-instant-search-ssr>
</template>

<script>
import {
  AisInstantSearchSsr,
  AisRefinementList,
  AisHits,
  AisHighlight,
  AisSearchBox,
  AisStats,
  AisPagination,
  createInstantSearch,
} from '../../../src/instantsearch'; // TODO: move this to 'vue-instantsearch'
import algoliasearch from 'algoliasearch/lite';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const { instantsearch, rootMixin } = createInstantSearch({
  searchClient,
  indexName: 'movies',
});

export default {
  asyncData() {
    return instantsearch
      .findResultsState({
        query: 'hi',
        hitsPerPage: 5,
        disjunctiveFacets: ['genre'],
        disjunctiveFacetsRefinements: { genre: ['Comedy'] },
      })
      .then(() => ({
        algoliaState: instantsearch.getState(),
      }));
  },
  beforeMount() {
    // Nuxt will merge `asyncData` and `data` on the client
    instantsearch.hydrate(this.algoliaState);
  },
  mixins: [rootMixin],
  components: {
    AisInstantSearchSsr,
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
          href:
            'https://unpkg.com/instantsearch.css@7.1.0/themes/algolia-min.css',
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
.ais-InstantSearch {
  margin: 1em;
}
</style>
