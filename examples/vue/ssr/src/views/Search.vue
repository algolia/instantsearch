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
} from '../../../../src/instantsearch.js'; // TODO: move this to 'vue-instantsearch'

export default {
  asyncData({ instantsearch }) {
    return instantsearch.findResultsState({
      query: 'hi',
      hitsPerPage: 5,
      disjunctiveFacets: ['genre'],
      disjunctiveFacetsRefinements: { genre: ['Comedy'] },
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
