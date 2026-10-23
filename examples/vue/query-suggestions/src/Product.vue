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
      <a href="/">← Back to search</a>
      <ais-instant-search
        :search-client="searchClient"
        index-name="instant_search"
        :insights="true"
      >
        <ais-configure :hits-per-page.camel="1" :filters="`objectID:${pid}`" />
        <ais-hits :class-names="{ 'ais-Hits': 'ais-Hits--single' }">
          <template #item="{ item }">
            <article>
              <img :src="item.image" :alt="item.name" />
              <div>
                <h1>{{ item.name }}</h1>
                <p>{{ item.description }}</p>
              </div>
            </article>
          </template>
        </ais-hits>
      </ais-instant-search>
    </div>
  </div>
</template>

<script>
import { liteClient as algoliasearch } from 'algoliasearch/lite';

import 'instantsearch.css/themes/satellite.css';
import './app.css';

export default {
  props: { pid: { type: String, default: '' } },
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
