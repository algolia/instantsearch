<template>
  <div>
    <header class="header">
      <h1 class="header-title">
        <a href="/">{{name}}</a>
      </h1>
      <p class="header-subtitle">
        using
        <a href="https://github.com/algolia/instantsearch/tree/master/packages/vue-instantsearch">
          Vue InstantSearch
        </a>
      </p>
    </header>

    <div class="container">
      <ais-index app-id="{{appId}}" api-key="{{apiKey}}" index-name="{{indexName}}">
        <div class="search-panel">
          {{#if attributesForFaceting.length}}
          <div class="search-panel__filters">
            {{#each attributesForFaceting}}
            <ais-refinement-list attribute-name="{{this}}"></ais-refinement-list>
            {{/each}}
          </div>

          {{/if}}
          <div class="search-panel__results">
            <div class="searchbox">
              <ais-search-box
                placeholder="{{searchPlaceholder}}"
                class="ais-SearchBox-form"
                :class-names="{
                  'ais-search-box': 'ais-SearchBox',
                  'ais-input': 'ais-SearchBox-input',
                  'ais-clear': 'ais-SearchBox-reset',
                  'ais-clear--disabled': 'ais-SearchBox-reset--disabled',
                  'ais-search-box__submit': 'ais-SearchBox-submit',
                  'ais-search-box__loading-indicator':
                    'ais-SearchBox-loadingIndicator',
                }"
              />
            </div>

            {{#if attributesToDisplay}}
            <ais-results class="ais-Hits-list">
              <template slot-scope="{ result }">
                <article class="ais-Hits-item">
                  <h1>
                    <ais-highlight
                      :result="result"
                      attribute-name="{{attributesToDisplay.[0]}}"
                    />
                  </h1>
                  {{#each attributesToDisplay}}
                  {{#unless @first}}
                  <p>
                    <ais-highlight
                      :result="result"
                      attribute-name="{{this}}"
                    />
                  </p>
                  {{/unless}}
                  {{/each}}
                </article>
              </template>
            </ais-results>
            {{else}}
            <ais-results class="ais-Hits-list" />
            {{/if}}

            <div class="pagination">
              <ais-pagination
                :class-names="{
                  'ais-pagination': 'ais-Pagination-list',
                  'ais-pagination__item': 'ais-Pagination-item',
                  'ais-pagination__item--active':
                    'ais-Pagination-item--selected',
                  'ais-pagination__item--next': 'ais-Pagination-item--next',
                  'ais-pagination__item--previous':
                    'ais-Pagination-item--previous',
                  'ais-pagination__item--disabled':
                    'ais-Pagination-item--disabled',
                  'ais-pagination__item--first': 'ais-Pagination-item--first',
                  'ais-pagination__item--last': 'ais-Pagination-item--last',
                  'ais-pagination__link': 'ais-Pagination-link',
                }"
              />
            </div>
          </div>
        </div>
      </ais-index>
    </div>
  </div>
</template>

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
