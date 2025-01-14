<template>
  <div id="root">
    <ais-instant-search
      :search-client="searchClient"
      index-name="instant_search"
      :routing="routing"
      :insights="true"
    >
      <ais-configure
        :attributes-to-snippet.camel="['description:10']"
        :snippet-ellipsis-text.camel="'…'"
        :remove-words-if-no-result.camel="'allOptional'"
      />

      <header class="header" id="header">
        <p class="header-logo">
          <a href="https://algolia.com" aria-label="Go to the Algolia website">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 117">
              <path
                fill="#FFF"
                d="M249.5 64.2V1.4c0-.9-.7-1.5-1.6-1.4L236.2 2a1.4 1.4 0 0 0-1.2 1.3V67c0 3 0 21.6 22.4 22.3a1.4 1.4 0 0 0 1.5-1.4v-9.5c0-.7-.6-1.3-1.2-1.4-8.2-.9-8.2-11-8.2-12.7ZM443.5 24.4h-11.8c-.8 0-1.4.6-1.4 1.4v62c0 .8.6 1.4 1.4 1.4h11.8c.8 0 1.4-.6 1.4-1.4v-62c0-.8-.6-1.4-1.4-1.4ZM431.7 16.6h11.8c.8 0 1.4-.6 1.4-1.3v-14c0-.8-.7-1.4-1.6-1.3L431.5 2a1.4 1.4 0 0 0-1.2 1.3v12c0 .8.6 1.4 1.4 1.4Zm-20.5 47.6V1.4c0-.9-.7-1.5-1.5-1.4L397.9 2a1.4 1.4 0 0 0-1.2 1.3V67c0 3 0 21.6 22.4 22.3a1.4 1.4 0 0 0 1.5-1.4v-9.5c0-.7-.5-1.3-1.2-1.4-8.2-.9-8.2-11-8.2-12.7Zm-30.7-31c-2.6-2.8-5.8-5-9.6-6.5a31.7 31.7 0 0 0-12-2.3c-4.5 0-8.5.7-12.2 2.3A27.9 27.9 0 0 0 331 43.5a39.6 39.6 0 0 0 0 26.3c1.5 4 3.6 7.5 6.2 10.3 2.6 2.9 5.8 5 9.5 6.7a38 38 0 0 0 12.2 2.4c2.8 0 8.6-.9 12.3-2.4a27 27 0 0 0 9.5-6.7 35.1 35.1 0 0 0 8.3-23c0-4.9-.8-9.6-2.4-13.6-1.5-4-3.5-7.4-6.1-10.2ZM370 71.5a13.1 13.1 0 0 1-11.2 5.6 13 13 0 0 1-11.2-5.6c-2.7-3.6-4-7.9-4-14.2 0-6.3 1.3-11.5 4-15.1a13 13 0 0 1 11.1-5.5 13 13 0 0 1 11.3 5.5c2.6 3.6 4 8.8 4 15 0 6.4-1.3 10.6-4 14.3Zm-161.6-47H197a32 32 0 0 0-27 15 33.8 33.8 0 0 0 8.9 45.9 18.8 18.8 0 0 0 11.2 3.1H191.2l.6-.2h.2a21 21 0 0 0 16.5-14.6V87c0 .8.6 1.4 1.4 1.4h11.7c.8 0 1.4-.6 1.4-1.4V25.8c0-.8-.6-1.4-1.4-1.4h-13Zm0 48.3a17.8 17.8 0 0 1-10.4 3.5h-.2a12.5 12.5 0 0 1-.7 0A18.4 18.4 0 0 1 180.4 51c2.7-6.8 9-11.6 16.6-11.6h11.5v33.3Zm289-48.3H486a32 32 0 0 0-27 15 33.8 33.8 0 0 0 8.8 45.9 18.8 18.8 0 0 0 11.3 3.1h1.1l.6-.2h.2a21 21 0 0 0 16.5-14.6V87c0 .8.6 1.4 1.4 1.4h11.7c.8 0 1.4-.6 1.4-1.4V25.8c0-.8-.6-1.4-1.4-1.4h-13.1Zm0 48.3a17.8 17.8 0 0 1-10.5 3.5h-.9A18.4 18.4 0 0 1 469.4 51c2.6-6.8 9-11.6 16.6-11.6h11.5v33.3ZM306.3 24.4h-11.5a32 32 0 0 0-27 15 33.7 33.7 0 0 0-5.1 14.6 34.6 34.6 0 0 0 0 7.6c1 8.9 5.4 16.7 11.8 22a19.5 19.5 0 0 0 2.2 1.7 18.8 18.8 0 0 0 21.6-.6c3.8-2.7 6.7-6.7 8-11.1V87.9c0 5-1.3 8.9-4 11.5-2.7 2.6-7.3 3.9-13.6 3.9-2.6 0-6.7-.2-10.9-.6a1.4 1.4 0 0 0-1.4 1l-3 10a1.4 1.4 0 0 0 1.1 1.8c5 .7 10 1 12.8 1 11.4 0 19.8-2.4 25.3-7.4 5-4.6 7.8-11.4 8.2-20.7V25.8c0-.8-.6-1.4-1.3-1.4h-13.2Zm0 15s.2 32.4 0 33.4a17.5 17.5 0 0 1-10 3.4h-.2a13.6 13.6 0 0 1-1.7 0A18.7 18.7 0 0 1 278.3 51c2.6-6.8 9-11.6 16.5-11.6h11.5ZM58.2 0A58.3 58.3 0 1 0 86 109.5c.9-.5 1-1.6.3-2.2l-5.5-4.9a3.8 3.8 0 0 0-4-.6A47 47 0 0 1 11 57.5 47.3 47.3 0 0 1 58.2 11h47.3v84L78.7 71.2a2 2 0 0 0-3 .3 22 22 0 1 1 4.4-15.2 4 4 0 0 0 1.3 2.6l7 6.2c.8.7 2 .3 2.3-.8a33 33 0 0 0-30.4-39 33 33 0 0 0-35 32 33.3 33.3 0 0 0 32.2 33.9 32.8 32.8 0 0 0 20-6.3l35.1 31c1.5 1.4 3.9.3 3.9-1.7V2.2a2.2 2.2 0 0 0-2.2-2.2h-56Z"
              />
            </svg>
          </a>
        </p>

        <p class="header-title">Stop looking for an item — find it.</p>

        <ais-search-box placeholder="Product, brand, color, …">
          <template #submit-icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 18 18"
              width="16"
              height="16"
            >
              <g
                fill="none"
                fill-rule="evenodd"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.67"
                transform="translate(1 1)"
              >
                <circle cx="7.11" cy="7.11" r="7.11" />
                <path d="M16 16l-3.87-3.87" />
              </g>
            </svg>
          </template>
        </ais-search-box>
      </header>

      <main class="container">
        <div class="container-wrapper">
          <section class="container-filters">
            <div class="container-header">
              <h2>Filters</h2>

              <ais-clear-refinements data-layout="desktop">
                <template #resetLabel>
                  <div class="clear-filters">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 11 11"
                    >
                      <g fill="none" fill-rule="evenodd" opacity=".4">
                        <path d="M0 0h11v11H0z" />
                        <path
                          fill="#000"
                          fill-rule="nonzero"
                          d="M8.26 2.75a3.896 3.896 0 1 0 1.102 3.262l.007-.056a.49.49 0 0 1 .485-.456c.253 0 .451.206.437.457 0 0 .012-.109-.006.061a4.813 4.813 0 1 1-1.348-3.887v-.987a.458.458 0 1 1 .917.002v2.062a.459.459 0 0 1-.459.459H7.334a.458.458 0 1 1-.002-.917h.928z"
                        />
                      </g>
                    </svg>
                    Clear filters
                  </div>
                </template>
              </ais-clear-refinements>

              <ais-stats data-layout="mobile">
                <template #default="{ nbHits }">
                  <span class="ais-Stats-text">
                    <strong>{{ formatNumber(nbHits) }}</strong> results
                  </span>
                </template>
              </ais-stats>
            </div>

            <div class="container-body">
              <ais-panel>
                <template #header> Category </template>

                <template #default>
                  <ais-hierarchical-menu
                    :attributes="[
                      'hierarchicalCategories.lvl0',
                      'hierarchicalCategories.lvl1',
                    ]"
                  />
                </template>
              </ais-panel>

              <ais-panel>
                <template #header> Brands </template>

                <template #default>
                  <ais-refinement-list
                    attribute="brand"
                    searchable
                    searchable-placeholder="Search for brands…"
                  />
                </template>
              </ais-panel>

              <ais-panel>
                <template #header> Price </template>

                <template #default>
                  <ais-range-input attribute="price">
                    <template
                      #default="{ currentRefinement, range, refine, canRefine }"
                    >
                      <vue-slider
                        :min="range.min"
                        :max="range.max"
                        :value="toValue(currentRefinement, range)"
                        :disabled="!canRefine"
                        :lazy="true"
                        :use-keyboard="true"
                        :enable-cross="false"
                        tooltip="always"
                        :duration="0"
                        @change="refine({ min: $event[0], max: $event[1] })"
                      >
                        <template #dot="{ index, value }">
                          <div
                            :aria-valuemin="range.min"
                            :aria-valuemax="range.max"
                            :aria-valuenow="value"
                            :data-handle-key="index"
                            class="vue-slider-dot-handle"
                            role="slider"
                            tabindex="0"
                          />
                        </template>
                        <template #tooltip="{ value }">
                          {{ formatNumber(value) }}
                        </template>
                      </vue-slider>
                    </template>
                  </ais-range-input>
                </template>
              </ais-panel>

              <ais-panel>
                <template #header> Free shipping </template>

                <template #default>
                  <ais-toggle-refinement
                    attribute="free_shipping"
                    label="Display only items with free shipping"
                  />
                </template>
              </ais-panel>

              <ais-panel>
                <template #header> Ratings </template>

                <template #default>
                  <ais-rating-menu attribute="rating">
                    <template #default="{ items, refine, createURL }">
                      <ul class="ais-RatingMenu-list">
                        <li
                          :class="{
                            'ais-RatingMenu-item': true,
                            'ais-RatingMenu-item--selected':
                              items.every((item) => !item.isRefined) ||
                              item.isRefined,
                          }"
                          v-for="item in items"
                          :key="item.value"
                        >
                          <a
                            class="ais-RatingMenu-link"
                            :aria-label="item.value + ' & up'"
                            :href="createURL(item.value)"
                            @click.prevent="refine(item.value)"
                          >
                            <span
                              v-for="(full, index) in item.stars"
                              :key="index"
                            >
                              <svg
                                :class="{
                                  'ais-RatingMenu-starIcon': true,
                                  'ais-RatingMenu-starIcon--full': full,
                                  'ais-RatingMenu-starIcon--empty': !full,
                                }"
                                aria-hidden="true"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M10.472 5.008L16 5.816l-4 3.896.944 5.504L8 12.616l-4.944 2.6L4 9.712 0 5.816l5.528-.808L8 0z"
                                />
                              </svg>
                            </span>

                            <span class="ais-RatingMenu-count">{{
                              item.count
                            }}</span>
                          </a>
                        </li>
                      </ul>
                    </template>
                  </ais-rating-menu>
                </template>
              </ais-panel>
            </div>
          </section>

          <footer class="container-filters-footer" data-layout="mobile">
            <clear-refinements
              class="container-filters-footer-button-wrapper"
              @click="closeFilters"
            />

            <ais-stats class="container-filters-footer-button-wrapper">
              <template #default="{ nbHits }">
                <button class="button button-primary" @click="closeFilters">
                  See {{ formatNumber(nbHits) }} results
                </button>
              </template>
            </ais-stats>
          </footer>
        </div>

        <section class="container-results">
          <header class="container-header container-options">
            <ais-sort-by
              class="container-option"
              :items="[
                { value: 'instant_search', label: 'Featured' },
                { value: 'instant_search_price_asc', label: 'Price ascending' },
                {
                  value: 'instant_search_price_desc',
                  label: 'Price descending',
                },
              ]"
            />

            <ais-hits-per-page
              class="container-option"
              :items="[
                {
                  label: '16 hits per page',
                  value: 16,
                  default: true,
                },
                {
                  label: '32 hits per page',
                  value: 32,
                },
                {
                  label: '64 hits per page',
                  value: 64,
                },
              ]"
            />
          </header>

          <ais-hits>
            <template #item="{ item }">
              <article class="hit">
                <header class="hit-image-container">
                  <img :src="item.image" :alt="item.name" class="hit-image" />
                </header>

                <div class="hit-info-container">
                  <p class="hit-category">
                    {{ item.categories[0] }}
                  </p>
                  <h1>
                    <ais-highlight attribute="name" :hit="item" />
                  </h1>
                  <p class="hit-description">
                    <ais-snippet attribute="description" :hit="item" />
                  </p>
                  <footer>
                    <p>
                      <span class="hit-em">$&nbsp;</span>
                      <strong>{{ formatNumber(item.price) }}</strong>
                      <span class="hit-em hit-rating">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          width="8"
                          height="8"
                        >
                          <path
                            fill="#e2a400"
                            fill-rule="evenodd"
                            d="M10.472 5.008L16 5.816l-4 3.896.944 5.504L8 12.616l-4.944 2.6L4 9.712 0 5.816l5.528-.808L8 0z"
                          />
                        </svg>
                        {{ item.rating }}
                      </span>
                    </p>
                  </footer>
                </div>
              </article>
            </template>
          </ais-hits>

          <no-results />

          <footer class="container-footer">
            <ais-pagination :padding="2">
              <template
                #default="{
                  currentRefinement,
                  pages,
                  isFirstPage,
                  isLastPage,
                  refine,
                  createURL,
                }"
              >
                <ul class="ais-Pagination-list">
                  <li
                    class="ais-Pagination-item ais-Pagination-item--previousPage ais-Pagination-item--disabled"
                    v-if="isFirstPage"
                  >
                    <span class="ais-Pagination-link">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 10 10"
                        width="10"
                        height="10"
                      >
                        <g
                          fill="none"
                          fill-rule="evenodd"
                          stroke="#000"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.143"
                        >
                          <path d="M9 5H1M5 9L1 5l4-4" />
                        </g>
                      </svg>
                    </span>
                  </li>

                  <li
                    class="ais-Pagination-item ais-Pagination-item--previousPage"
                    v-if="!isFirstPage"
                  >
                    <a
                      class="ais-Pagination-link"
                      :href="createURL(currentRefinement - 1)"
                      @click.prevent="refine(currentRefinement - 1)"
                      aria-label="Previous"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 10 10"
                        width="10"
                        height="10"
                      >
                        <g
                          fill="none"
                          fill-rule="evenodd"
                          stroke="#000"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.143"
                        >
                          <path d="M9 5H1M5 9L1 5l4-4" />
                        </g>
                      </svg>
                    </a>
                  </li>

                  <li
                    :class="{
                      'ais-Pagination-item': true,
                      'ais-Pagination-item--page': true,
                      'ais-Pagination-item--selected':
                        page === currentRefinement,
                    }"
                    v-for="page in pages"
                    :key="page"
                  >
                    <a
                      class="ais-Pagination-link"
                      :href="createURL(page)"
                      :style="{
                        fontWeight: page === currentRefinement ? 'bold' : '',
                      }"
                      @click.prevent="refine(page)"
                      >{{ page + 1 }}</a
                    >
                  </li>

                  <li
                    class="ais-Pagination-item ais-Pagination-item--nextPage"
                    v-if="!isLastPage"
                  >
                    <a
                      class="ais-Pagination-link"
                      :href="createURL(currentRefinement + 1)"
                      @click.prevent="refine(currentRefinement + 1)"
                      aria-label="Next"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 10 10"
                        width="10"
                        height="10"
                      >
                        <g
                          fill="none"
                          fill-rule="evenodd"
                          stroke="#000"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.143"
                        >
                          <path d="M1 5h8M5 9l4-4-4-4" />
                        </g>
                      </svg>
                    </a>
                  </li>

                  <li
                    class="ais-Pagination-item ais-Pagination-item--nextPage ais-Pagination-item--disabled"
                    v-if="isLastPage"
                  >
                    <span class="ais-Pagination-link">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 10 10"
                        width="10"
                        height="10"
                      >
                        <g
                          fill="none"
                          fill-rule="evenodd"
                          stroke="#000"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.143"
                        >
                          <path d="M1 5h8M5 9l4-4-4-4" />
                        </g>
                      </svg>
                    </span>
                  </li>
                </ul>
              </template>
            </ais-pagination>
          </footer>
        </section>
      </main>

      <aside data-layout="mobile">
        <button class="filters-button" @click="openFilters">
          <svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 16 14">
            <path
              d="M15 1H1l5.6 6.3v4.37L9.4 13V7.3z"
              stroke="#fff"
              stroke-width="1.29"
              fill="none"
              fill-rule="evenodd"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          Filters
        </button>
      </aside>
    </ais-instant-search>
  </div>
</template>

<script>
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import VueSlider from 'vue-slider-component';

import getRouting from './routing';
import { formatNumber } from './utils';
import ClearRefinements from './widgets/ClearRefinements.vue';
import NoResults from './widgets/NoResults.vue';

export default {
  components: {
    VueSlider,
    ClearRefinements,
    NoResults,
  },
  created() {
    this.onKeyUp = (event) => {
      if (event.key !== 'Escape') {
        return;
      }
      this.closeFilters();
    };

    this.onClick = (event) => {
      if (event.target !== this.header) {
        return;
      }

      this.closeFilters();
    };
  },
  mounted() {
    this.resultsContainer = document.querySelector('.container-results');
    this.header = document.querySelector('#header');
  },
  data() {
    return {
      searchClient: algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76'
      ),
      routing: getRouting({ indexName: 'instant_search' }),
    };
  },
  methods: {
    formatNumber,
    toValue(value, range) {
      return [
        typeof value.min === 'number' ? value.min : range.min,
        typeof value.max === 'number' ? value.max : range.max,
      ];
    },
    openFilters() {
      document.body.classList.add('filtering');
      window.scrollTo(0, 0);
      window.addEventListener('keyup', this.onKeyUp);
      window.addEventListener('click', this.onClick);
    },
    closeFilters() {
      document.body.classList.remove('filtering');
      this.resultsContainer.scrollIntoView();
      window.removeEventListener('keyup', this.onKeyUp);
      window.removeEventListener('click', this.onClick);
    },
  },
};
</script>
