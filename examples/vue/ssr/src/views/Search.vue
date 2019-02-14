<template>
  <ais-instant-search-ssr>
    <ais-search-box />
    <ais-stats />
    <ais-refinement-list attribute="brand" />
    <ais-hits>
      <template
        slot="item"
        slot-scope="{ item }"
      >
        <p>
          <ais-highlight
            attribute="name"
            :hit="item"
          />
        </p>
        <p>
          <ais-highlight
            attribute="brand"
            :hit="item"
          />
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
} from 'vue-instantsearch';

export default {
  asyncData({ instantsearch }) {
    return instantsearch.findResultsState({
      query: 'hi',
      hitsPerPage: 5,
      disjunctiveFacets: ['brand'],
      disjunctiveFacetsRefinements: { brand: ['Apple'] },
    });
  },
  components: {
    AisInstantSearchSsr,
    AisRefinementList,
    AisHits,
    AisHighlight,
    AisSearchBox,
    AisStats,
    AisPagination,
  },
};
</script>

<style>
.ais-Hits-list {
  text-align: left;
}
</style>
