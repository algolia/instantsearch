<template>
  <div>
    <header class="header">
      <h1 class="header-title">
        <a href="/">
          vue-instantsearch-app
        </a>
      </h1>
      <p class="header-subtitle">
        using
        <a href="https://github.com/algolia/vue-instantsearch">
          Vue InstantSearch
        </a>
      </p>
    </header>

    <div class="container">
      <ais-instant-search-ssr>
        <div class="search-panel">
          <div class="search-panel__filters">
            <ais-panel>
              <ais-refinement-list attribute="brand" />
            </ais-panel>
          </div>

          <div class="search-panel__results">
            <div class="searchbox">
              <ais-search-box placeholder="" />
            </div>
            <ais-hits>
              <template v-slot:item="{ item }">
                <article>
                  <h1>
                    <ais-highlight
                      :hit="item"
                      attribute="name"
                    />
                  </h1>
                  <p>
                    <ais-highlight
                      :hit="item"
                      attribute="description"
                    />
                  </p>
                </article>
              </template>
            </ais-hits>

            <div class="pagination">
              <ais-pagination />
            </div>
          </div>
        </div>
      </ais-instant-search-ssr>
    </div>
  </div>
</template>

<script>
import {
  AisInstantSearchSsr,
  AisPanel,
  AisRefinementList,
  AisSearchBox,
  AisHits,
  AisHighlight,
  AisPagination,
} from 'vue-instantsearch/dist/vue3/es';

export default {
  components: {
    AisInstantSearchSsr,
    AisPanel,
    AisRefinementList,
    AisSearchBox,
    AisHits,
    AisHighlight,
    AisPagination,
  },
};
</script>

<style scoped>
body,
h1 {
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
}

em {
  background: cyan;
  font-style: normal;
}

.header {
  display: flex;
  align-items: center;
  min-height: 50px;
  padding: 0.5rem 1rem;
  background-image: linear-gradient(to right, #4dba87, #2f9088);
  color: #fff;
  margin-bottom: 1rem;
}

.header a {
  color: #fff;
  text-decoration: none;
}

.header-title {
  font-size: 1.2rem;
  font-weight: normal;
}

.header-title::after {
  content: ' ▸ ';
  padding: 0 0.5rem;
}

.header-subtitle {
  font-size: 1.2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.search-panel {
  display: flex;
}

.search-panel__filters {
  flex: 1;
}

.search-panel__results {
  flex: 3;
}

.searchbox {
  margin-bottom: 2rem;
}

.pagination {
  margin: 2rem auto;
  text-align: center;
}
</style>
