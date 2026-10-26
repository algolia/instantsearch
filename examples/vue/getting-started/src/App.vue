<template>
  <div>
    <header class="header">
      <h1 class="header-title">
        <a href="/">Getting started</a>
      </h1>
      <p class="header-subtitle">
        using
        <a
          href="https://github.com/algolia/instantsearch/tree/master/packages/vue-instantsearch"
        >
          Vue InstantSearch
        </a>
      </p>
    </header>

    <div class="container">
      <ais-instant-search
        :search-client="searchClient"
        index-name="instant_search"
        :insights="true"
      >
        <ais-configure :hits-per-page.camel="8" />
        <div class="search-panel">
          <div class="search-panel__filters">
            <ais-panel>
              <template #header>brand</template>
              <ais-refinement-list attribute="brand" />
            </ais-panel>
          </div>

          <div class="search-panel__results">
            <div class="searchbox">
              <ais-search-box placeholder="" />
            </div>
            <ais-hits>
              <template slot="item" slot-scope="{ item }">
                <article>
                  <h1>
                    <ais-highlight :hit="item" attribute="name" />
                  </h1>
                  <p>
                    <ais-highlight :hit="item" attribute="description" />
                  </p>
                </article>
              </template>
            </ais-hits>

            <div class="pagination">
              <ais-pagination />
            </div>

            <ais-trending-items :limit="6" layout="carousel">
              <template #item="{ item }">
                <article class="trending-item">
                  <div class="trending-item-image">
                    <img :src="item.image" :alt="item.name" />
                  </div>
                  <h2 class="trending-item-title">{{ item.name }}</h2>
                </article>
              </template>
            </ais-trending-items>
          </div>
        </div>

        <ais-chat
          agent-id="eedef238-5468-470d-bc37-f99fa741bd25"
          :feedback="true"
        >
          <template #item="{ item }">
            <article class="chat-item">
              <img :src="item.image" :alt="item.name" />
              <h2 class="chat-item-title">{{ item.name }}</h2>
            </article>
          </template>
        </ais-chat>
        <ais-chat-trigger />
      </ais-instant-search>
    </div>
  </div>
</template>

<script>
import { liteClient as algoliasearch } from 'algoliasearch/lite';

export default {
  data() {
    return {
      searchClient: algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76'
      ),
    };
  },
};
</script>

<style>
body,
h1 {
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial,
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
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

.ais-Carousel-list {
  grid-auto-columns: calc(25% - 0.5rem);
}

.trending-item-image img {
  width: 100%;
  height: 8rem;
  object-fit: contain;
}

.trending-item-title {
  font-size: 0.875rem;
  font-weight: normal;
  text-align: center;
}

.chat-item img {
  width: 100%;
  height: 6rem;
  object-fit: contain;
}

.chat-item-title {
  font-size: 0.75rem;
  font-weight: normal;
  text-align: center;
}
</style>
