<template>
  <div>
    <header class="header">
      <h1 class="header-title">
        <a href="/">{{ name }}</a>
      </h1>
      <p class="header-subtitle">
        using
        <a href="https://github.com/algolia/instantsearch/tree/master/packages/vue-instantsearch">
          Vue InstantSearch
        </a>
      </p>
    </header>

    <div class="container">
      <ais-instant-search
        :search-client="searchClient"
        index-name="{{indexName}}"
        :future="future"
        {{#if flags.insights}}insights{{/if}}
      >
        <ais-configure :hits-per-page.camel="8" />
        <div class="search-panel">
          <div class="search-panel__filters">
            {{#if flags.dynamicWidgets}}
            <ais-dynamic-widgets>
              {{#each attributesForFaceting}}
              <ais-panel>
                <template v-slot:header>{{this}}</template>
                <ais-refinement-list attribute="{{this}}" />
              </ais-panel>
              {{/each}}
            </ais-dynamic-widgets>
            {{else}}
            {{#each attributesForFaceting}}
            <ais-panel>
              <template v-slot:header>{{this}}</template>
              <ais-refinement-list attribute="{{this}}" />
            </ais-panel>
            {{/each}}
            {{/if}}
          </div>

          <div class="search-panel__results">
            <div class="searchbox">
              <ais-search-box placeholder="{{searchPlaceholder}}" />
            </div>
            {{#if attributesToDisplay}}
            <ais-hits>
              <template v-slot:item="{ item }">
                <article>
                  {{#if imageAttribute}}
                  <img :src="item.{{imageAttribute}}" :alt="item.{{attributesToDisplay.[0]}}" />
                  {{/if}}
                  <div>
                    <h1>
                      <ais-highlight
                        :hit="item"
                        attribute="{{attributesToDisplay.[0]}}"
                      />
                    </h1>
                    {{#each attributesToDisplay}}
                    {{#unless @first}}
                    <p>
                      <ais-highlight :hit="item" attribute="{{this}}" />
                    </p>
                    {{/unless}}
                    {{/each}}
                  </div>
                </article>
              </template>
            </ais-hits>
            {{else}}
            <ais-hits />
            {{/if}}

            <div class="pagination">
              <ais-pagination />
            </div>
          </div>
        </div>
      </ais-instant-search>
    </div>
  </div>
</template>

<script>
import algoliasearch from 'algoliasearch/lite';

export default {
  data() {
    return {
      searchClient: algoliasearch('{{appId}}', '{{apiKey}}'),
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
    Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
}

h1 {
  font-size: 1rem;
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

.ais-Hits-item article {
  display: flex;
}

.ais-Hits-item img {
  max-height: 125px;
  padding-right: 16px;
}
</style>
