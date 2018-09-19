<template>
  <div id="root">
    <ais-index
      :search-client="searchClient"
      index-name="instant_search"
      :routing="true"
    >
      <ais-configure :hitsPerPage="16" />

      <header class="navbar">
        <img src="https://res.cloudinary.com/hilnmyskv/image/upload/w_100,h_100,dpr_2.0//v1461180087/logo-instantsearchjs-avatar.png" width="40">
        <h1 class="navbar__title">aeki</h1>
        <ais-search-box placeholder="Search a product" />
      </header>

      <div class="content-wrapper">
        <aside>
          <ais-clear-refinements>
            <template slot="resetLabel">
              Clear all filters
            </template>
          </ais-clear-refinements>

          <section class="facet-wrapper">
            <div class="facet-title">Show results for</div>
            <ais-hierarchical-menu
              :attributes="[
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
                'hierarchicalCategories.lvl2',
              ]"
            />
          </section>

          <section class="facet-wrapper">
            <div class="facet-title">Refine By</div>

            <ais-panel>
              <template slot="header">
                <h5>Type</h5>
              </template>
              <template slot="default">
                <ais-refinement-list
                  attribute="type"
                  operator="or"
                  :max="5"
                />
              </template>
            </ais-panel>

            <ais-panel>
              <template slot="header">
                <h5>Brand</h5>
              </template>
              <template slot="default">
                <ais-refinement-list
                  searchable
                  attribute="brand"
                  operator="or"
                  :max="5"
                />
              </template>
            </ais-panel>

            <ais-panel>
              <template slot="header">
                <h5>Rating</h5>
              </template>
              <template slot="default">
                <ais-rating-menu
                  attribute="rating"
                  :max="5"
                />
              </template>
            </ais-panel>

            <ais-panel>
              <template slot="header">
                <h5>Price</h5>
              </template>
              <template slot="default">
                <ais-range-input attribute="price" />
              </template>
            </ais-panel>

          </section>

          <div class="thank-you">
            Data courtesy of <a href="https://developer.bestbuy.com/">Best Buy</a>
          </div>
        </aside>

        <main class="results">
          <div class="results-header">
            <ais-stats />
            <ais-sort-by
              :items="[
                { name: 'instant_search', label: 'Featured' },
                { name: 'instant_search_price_asc', label: 'Price asc.' },
                { name: 'instant_search_price_desc', label: 'Price desc.' },
              ]"
            />

          </div>
          <ais-hits>
            <div
              slot="default"
              slot-scope="{ items }"
              class="products"
            >
              <ais-search-state>
                <template slot-scope="{ query, hits }">
                  <div class="results-wrapper" v-if="hits.length === 0">
                    <div class="no-results">
                      No results found matching <span class="query">{{query}}</span>
                    </div>
                  </div>
                </template>
              </ais-search-state>
              <article
                v-for="item in items"
                :key="item.objectID"
                class="product"
              >
                <div class="product-picture-wrapper">
                  <img class="product-picture" :src="item.image" :alt="item.name" />
                </div>
                <div class="product-desc-wrapper">
                  <div class="product-name">
                    <ais-highlight attribute="name" :hit="item" />
                  </div>
                  <div class="product-brand">
                    <ais-highlight attribute="brand" :hit="item" />
                  </div>
                  <div class="product-footer">
                    <div class="ais-RatingMenu-link">
                      <svg
                        v-for="(_,i) in 5"
                        :key="i"
                        :class="[
                          'ais-RatingMenu-starIcon',
                          i >= item.rating && 'ais-RatingMenu-starIcon--empty'
                        ]"
                        aria-hidden="true"
                        width="24"
                        height="24"
                      >
                        <use
                          :xlink:href="`#ais-RatingMenu-star${i >= item.rating ? 'Empty' : ''}Symbol`"
                        />
                      </svg>
                    </div>
                    <div class="product-price">${{ item.price }}</div>
                  </div>
                </div>
              </article>
            </div>
          </ais-hits>
          <ais-pagination :padding="2" />
        </main>
      </div>
    </ais-index>
  </div>
</template>

<script>
import algoliasearch from 'algoliasearch/lite';
import './App.css';

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
