<template>
  <div id="root">
    <ais-instant-search
      :search-client="searchClient"
      index-name="instant_search"
      :routing="routing"
      :insights="true"
    >
      <ais-configure :hits-per-page.camel="16" />

      <header class="header">
        <img
          class="logo"
          src="https://res.cloudinary.com/hilnmyskv/image/upload/w_100,h_100,dpr_2.0//v1461180087/logo-instantsearchjs-avatar.png"
          width="40"
        />
        <ais-search-box placeholder="Search a product" />
      </header>

      <main>
        <aside>
          <ais-clear-refinements>
            <template #resetLabel> Clear all filters </template>
          </ais-clear-refinements>

          <ais-panel>
            <template #header> Categories </template>
            <ais-hierarchical-menu
              :attributes="[
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
                'hierarchicalCategories.lvl2',
              ]"
            />
          </ais-panel>

          <ais-panel>
            <template #header> Brands </template>
            <ais-refinement-list attribute="brand" />
          </ais-panel>

          <ais-panel>
            <template #header> Rating </template>
            <ais-rating-menu attribute="rating" :max="5" />
          </ais-panel>

          <ais-panel>
            <template #header> Price </template>
            <ais-range-input attribute="price" />
          </ais-panel>

          <div class="thank-you">
            Data courtesy of
            <a href="https://developer.bestbuy.com/">Best Buy</a>
          </div>
        </aside>

        <section>
          <header class="section-header">
            <ais-stats />
            <div class="sort-by">
              <label>Sort by</label>
              <ais-sort-by
                :items="[
                  { value: 'instant_search', label: 'Featured' },
                  { value: 'instant_search_price_asc', label: 'Price asc.' },
                  { value: 'instant_search_price_desc', label: 'Price desc.' },
                ]"
              />
            </div>
          </header>

          <ais-state-results>
            <template #default="{ results: { query, hits } }">
              <p class="no-results" v-show="hits.length === 0">
                No results found matching <em>{{ query }}</em
                >.
              </p>
            </template>
          </ais-state-results>

          <ais-hits>
            <template #item="{ item }">
              <div class="product-desc-wrapper">
                <div class="product-name">
                  <ais-highlight attribute="name" :hit="item" />
                </div>
                <div class="product-type">
                  <ais-highlight attribute="type" :hit="item" />
                </div>
                <div class="product-footer">
                  <div class="ais-RatingMenu-link">
                    <svg
                      v-for="(_, i) in 5"
                      :key="i"
                      :class="[
                        'ais-RatingMenu-starIcon',
                        i >= item.rating && 'ais-RatingMenu-starIcon--empty',
                      ]"
                      aria-hidden="true"
                      width="24"
                      height="24"
                    >
                      <use
                        :xlink:href="`#ais-RatingMenu-star${
                          i >= item.rating ? 'Empty' : ''
                        }Symbol`"
                      />
                    </svg>
                  </div>
                  <div class="product-price">${{ item.price }}</div>
                </div>
              </div>
            </template>
          </ais-hits>
          <footer>
            <ais-pagination />
          </footer>
        </section>
      </main>
    </ais-instant-search>
  </div>
</template>

<script>
import { liteClient as algoliasearch } from 'algoliasearch-v5/lite';
import { history as historyRouter } from 'instantsearch.js/es/lib/routers';
import { simple as simpleMapping } from 'instantsearch.js/es/lib/stateMappings';

import './App.css';

export default {
  data() {
    return {
      searchClient: algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76'
      ),
      routing: {
        router: historyRouter({
          cleanUrlOnDispose: false,
        }),
        stateMapping: simpleMapping(),
      },
    };
  },
};
</script>
