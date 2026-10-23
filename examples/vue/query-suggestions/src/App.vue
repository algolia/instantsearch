<template>
  <div>
    <header class="header">
      <h1 class="header-title">
        <a href="/">Query suggestions</a>
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
        :routing="routing"
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
            <ais-experimental-autocomplete
              detached-media-query="(max-width: 1024px)"
              placeholder="Search for products"
              :indices="indices"
              :show-recent="true"
              :show-query-suggestions="showQuerySuggestions"
              :show-prompt-suggestions="showPromptSuggestions"
            >
              <template #header="{ indexName }">
                <span class="ais-AutocompleteIndexHeaderTitle">
                  {{ indexName === 'instant_search' ? 'Products' : indexName }}
                </span>
                <span class="ais-AutocompleteIndexHeaderLine" />
              </template>
              <template #item="{ item, onSelect }">
                <div @click="onSelect">{{ item.name }}</div>
              </template>
              <template #recentHeader>
                <span class="ais-AutocompleteIndexHeaderTitle">
                  Recent Searches
                </span>
                <span class="ais-AutocompleteIndexHeaderLine" />
              </template>
              <template #querySuggestionHeader>
                <span class="ais-AutocompleteIndexHeaderTitle">
                  Suggestions
                </span>
                <span class="ais-AutocompleteIndexHeaderLine" />
              </template>
              <template #promptSuggestionHeader>
                <span class="ais-AutocompleteIndexHeaderTitle">Ask AI</span>
                <span class="ais-AutocompleteIndexHeaderLine" />
              </template>
            </ais-experimental-autocomplete>

            <ais-hits>
              <template #item="{ item }">
                <article>
                  <h1>
                    <a :href="`/products.html?pid=${item.objectID}`">
                      <ais-highlight :hit="item" attribute="name" />
                    </a>
                  </h1>
                  <p>
                    <ais-highlight :hit="item" attribute="description" />
                  </p>
                  <a :href="`/products.html?pid=${item.objectID}`">
                    See product
                  </a>
                </article>
              </template>
            </ais-hits>

            <div class="pagination">
              <ais-pagination />
            </div>
          </div>
        </div>

        <ais-chat
          agent-id="eedef238-5468-470d-bc37-f99fa741bd25"
          :feedback="true"
        />
        <ais-chat-trigger />
      </ais-instant-search>
    </div>
  </div>
</template>

<script>
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { history } from 'instantsearch.js/es/lib/routers';

import 'instantsearch.css/themes/satellite.css';
import './app.css';

export default {
  data() {
    return {
      searchClient: algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76'
      ),
      routing: { router: history() },
      indices: [
        {
          indexName: 'instant_search',
          getURL: (item) => `/products.html?pid=${item.objectID}`,
        },
      ],
      showQuerySuggestions: {
        indexName: 'instant_search_demo_query_suggestions',
        searchParameters: { hitsPerPage: 2 },
      },
      showPromptSuggestions: {
        indexName: 'instant_search_prompt_suggestions',
        searchParameters: { hitsPerPage: 2 },
      },
    };
  },
};
</script>
