<template>
  <div id="root">
    <ais-instant-search
      :search-client="searchClient"
      index-name="instant_search"
      :routing="routing"
    >
      <ais-configure
        :attributesToSnippet="['description:10']"
        snippetEllipsisText="…"
        removeWordsIfNoResults="allOptional"
      />

      <header class="header" id="header">
        <p class="header-logo">
          <a href="https://algolia.com" aria-label="Go to the Algolia website">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 93 24">
              <path
                fill="#fff"
                fill-rule="nonzero"
                d="M18.46 0a2.805 2.805 0 0 1 2.797 2.808v15.718a2.805 2.805 0 0 1-2.799 2.807H2.8A2.805 2.805 0 0 1 0 18.526V2.8A2.8 2.8 0 0 1 2.799 0h15.66zm-7.587 5.39c-3.314 0-6.004 2.698-6.004 6.03 0 3.334 2.69 6.025 6.004 6.025 3.315 0 6.005-2.699 6.005-6.031S14.194 5.39 10.873 5.39zm0 10.276a4.24 4.24 0 0 1-4.23-4.245 4.24 4.24 0 0 1 4.23-4.245 4.24 4.24 0 0 1 4.23 4.245 4.236 4.236 0 0 1-4.23 4.245zm0-4.459c0 .09.097.154.18.11l2.8-1.454c.064-.032.083-.11.051-.175a3.48 3.48 0 0 0-2.9-1.767c-.065 0-.13.052-.13.123v3.163zM6.953 5.72l-.369-.368a.914.914 0 0 0-1.302 0l-.438.44a.923.923 0 0 0 0 1.306l.36.363c.06.06.141.045.194-.012a6.726 6.726 0 0 1 1.534-1.542c.065-.039.071-.13.02-.187zM12.84 4.03a.924.924 0 0 0-.922-.926H9.77a.925.925 0 0 0-.922.926v.75c0 .084.078.143.162.123a6.749 6.749 0 0 1 3.676-.018.126.126 0 0 0 .155-.122l-.001-.733zm42.686 13.534c0 1.94-.494 3.356-1.492 4.258-.996.9-2.519 1.35-4.57 1.35-.75 0-2.308-.146-3.553-.421l.459-2.253c1.043.22 2.418.277 3.138.277 1.142 0 1.958-.232 2.444-.697.49-.467.729-1.155.729-2.071v-.464a8.568 8.568 0 0 1-1.114.421c-.458.138-.99.211-1.586.211a5.99 5.99 0 0 1-2.147-.37 4.485 4.485 0 0 1-1.666-1.09c-.459-.48-.824-1.083-1.076-1.803-.255-.72-.386-2.004-.386-2.949 0-.884.137-1.996.407-2.736.276-.741.67-1.381 1.201-1.91.523-.531 1.164-.938 1.913-1.237a7.033 7.033 0 0 1 2.584-.486c.924 0 1.775.117 2.604.253.83.14 1.536.285 2.113.444v11.275l-.002-.002zm-7.91-5.608c0 1.192.262 2.514.787 3.067.523.55 1.2.827 2.03.827.451 0 .88-.067 1.28-.187.399-.125.72-.27.975-.445V8.165a11.296 11.296 0 0 0-1.877-.24c-1.033-.026-1.82.394-2.373 1.067-.544.677-.823 1.861-.823 2.965h.001zm21.417 0c0 .96-.139 1.686-.422 2.478a5.845 5.845 0 0 1-1.2 2.026 5.301 5.301 0 0 1-1.862 1.3c-.728.304-1.85.48-2.409.48-.56-.009-1.674-.169-2.394-.48a5.44 5.44 0 0 1-1.856-1.301c-.518-.56-.916-1.235-1.209-2.027a6.715 6.715 0 0 1-.436-2.477c0-.96.13-1.88.423-2.667a5.927 5.927 0 0 1 1.222-2.013 5.469 5.469 0 0 1 1.863-1.29c.72-.307 1.514-.451 2.373-.451.86 0 1.652.152 2.38.45A5.163 5.163 0 0 1 67.37 7.28c.518.56.917 1.226 1.21 2.013.305.783.456 1.707.456 2.664l-.002.001zm-2.91.007c0-1.227-.27-2.25-.794-2.96-.524-.72-1.259-1.077-2.198-1.077-.938 0-1.674.356-2.197 1.076-.524.717-.779 1.733-.779 2.96 0 1.244.262 2.08.784 2.8.526.725 1.262 1.08 2.2 1.08.938 0 1.674-.363 2.197-1.08.524-.728.784-1.556.784-2.8l.003.001zm9.247 6.28c-4.663.02-4.663-3.764-4.663-4.368L70.7.451 73.543 0v13.336c0 .343 0 2.507 1.828 2.515v2.39l-.001.003zm5.015 0h-2.859V5.976l2.86-.45v12.718zM78.95 4.187h.003a1.73 1.73 0 0 1-1.732-1.723c0-.95.77-1.72 1.73-1.72.963 0 1.733.77 1.733 1.72 0 .952-.777 1.723-1.734 1.723zm8.546 1.35c.938 0 1.732.116 2.373.347.641.235 1.155.56 1.535.973.379.416.649.983.808 1.579.168.595.249 1.25.249 1.968v7.307c-.436.096-1.1.205-1.987.336-.887.13-1.884.196-2.989.196a9.039 9.039 0 0 1-2.017-.214c-.61-.137-1.129-.362-1.565-.674a3.261 3.261 0 0 1-1.012-1.206c-.24-.493-.364-1.192-.364-1.92 0-.696.138-1.138.406-1.618.28-.48.649-.871 1.116-1.176a4.744 4.744 0 0 1 1.628-.654 9.197 9.197 0 0 1 2.925-.138 8.4 8.4 0 0 1 1.107.196v-.467c0-.325-.036-.637-.117-.928a2.003 2.003 0 0 0-.406-.776 1.895 1.895 0 0 0-.77-.523 3.375 3.375 0 0 0-1.218-.218c-.655 0-1.251.08-1.797.173a8.493 8.493 0 0 0-1.34.328l-.342-2.333c.356-.12.887-.246 1.571-.368.685-.124 1.42-.19 2.206-.19zm.239 10.307c.874 0 1.521-.05 1.973-.137v-2.891a5.441 5.441 0 0 0-.684-.14 6.908 6.908 0 0 0-.99-.072c-.312 0-.633.023-.953.073-.319.044-.61.131-.866.254a1.58 1.58 0 0 0-.618.524c-.16.226-.232.356-.232.697 0 .67.232 1.053.655 1.31.429.26.996.386 1.718.386l-.003-.004zM31.543 5.609c.94 0 1.732.118 2.373.35.64.232 1.156.56 1.536.973.385.421.647.98.807 1.576.168.596.247 1.25.247 1.97v7.306c-.438.093-1.098.204-1.986.333-.89.134-1.886.198-2.993.198a9.05 9.05 0 0 1-2.015-.211c-.612-.137-1.13-.363-1.566-.675a3.274 3.274 0 0 1-1.01-1.208c-.241-.493-.365-1.19-.365-1.917 0-.697.139-1.141.408-1.62.277-.48.647-.87 1.114-1.176a4.748 4.748 0 0 1 1.63-.653 9.333 9.333 0 0 1 1.934-.196 8.806 8.806 0 0 1 2.096.256v-.467c0-.325-.035-.64-.115-.93a1.986 1.986 0 0 0-.408-.775 1.92 1.92 0 0 0-.773-.524A3.374 3.374 0 0 0 31.243 8c-.655 0-1.252.08-1.798.174a8.018 8.018 0 0 0-1.338.328l-.343-2.334c.36-.122.89-.245 1.574-.369.681-.13 1.417-.19 2.202-.19h.003zm.247 10.316c.874 0 1.521-.049 1.973-.137v-2.892a5.524 5.524 0 0 0-.686-.14 6.923 6.923 0 0 0-.99-.072c-.313 0-.633.023-.956.073a2.88 2.88 0 0 0-.863.254 1.575 1.575 0 0 0-.62.524c-.159.226-.232.356-.232.697 0 .67.231 1.053.654 1.31.42.253.996.386 1.716.386l.004-.003zm11.535 2.32c-4.664.02-4.664-3.764-4.664-4.368L38.651.451 41.494 0v13.336c0 .343 0 2.507 1.828 2.515v2.39l.003.004z"
              ></path>
            </svg>
          </a>
        </p>

        <p class="header-title">Stop looking for an item — find it.</p>

        <ais-search-box
          placeholder="Product, brand, color, …"
        >
          <template slot="submit-icon">
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
                <circle cx="7.11" cy="7.11" r="7.11"></circle>
                <path d="M16 16l-3.87-3.87"></path>
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
                <template slot="resetLabel">
                  <div class="clear-filters">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 11 11"
                    >
                      <g fill="none" fill-rule="evenodd" opacity=".4">
                        <path d="M0 0h11v11H0z"></path>
                        <path
                          fill="#000"
                          fill-rule="nonzero"
                          d="M8.26 2.75a3.896 3.896 0 1 0 1.102 3.262l.007-.056a.49.49 0 0 1 .485-.456c.253 0 .451.206.437.457 0 0 .012-.109-.006.061a4.813 4.813 0 1 1-1.348-3.887v-.987a.458.458 0 1 1 .917.002v2.062a.459.459 0 0 1-.459.459H7.334a.458.458 0 1 1-.002-.917h.928z"
                        ></path>
                      </g>
                    </svg>
                    Clear filters
                  </div>
                </template>
              </ais-clear-refinements>

              <ais-stats data-layout="mobile">
                <template slot="default" slot-scope="{ nbHits }">
                  <span class="ais-Stats-text">
                    <strong>{{ formatNumber(nbHits) }}</strong> results
                  </span>
                </template>
              </ais-stats>
            </div>

            <div class="container-body">
              <ais-panel>
                <template slot="header">Category</template>

                <template slot="default">
                  <ais-hierarchical-menu
                    :attributes="[
                      'hierarchicalCategories.lvl0',
                      'hierarchicalCategories.lvl1'
                    ]"
                  />
                </template>
              </ais-panel>

              <ais-panel>
                <template slot="header">Brands</template>

                <template slot="default">
                  <ais-refinement-list
                    attribute="brand"
                    searchable
                    searchablePlaceholder="Search for brands…"
                  />
                </template>
              </ais-panel>

              <ais-panel>
                <template slot="header">Price</template>

                <template slot="default">
                  <ais-range-input attribute="price">
                    <div slot-scope="{ currentRefinement, range, refine, canRefine }">
                      <vue-slider
                        :min="range.min"
                        :max="range.max"
                        :value="toValue(currentRefinement, range)"
                        :disabled="!canRefine"
                        :lazy="true"
                        :useKeyboard="true"
                        :enableCross="false"
                        tooltip="always"
                        :duration="0"
                        @change="refine({ min: $event[0], max: $event[1] })"
                      >
                        <template slot="dot" slot-scope="{ index, value }">
                          <div :aria-valuemin="range.min" :aria-valuemax="range.max" :aria-valuenow="value" :data-handle-key="index" class="vue-slider-dot-handle" role="slider" tabindex="0" />
                        </template>
                        <template slot="tooltip" slot-scope="{ value }">
                          {{ formatNumber(value) }}
                        </template>
                      </vue-slider>
                    </div>
                  </ais-range-input>
                </template>
              </ais-panel>

              <ais-panel>
                <template slot="header">Free shipping</template>

                <template slot="default">
                  <ais-toggle-refinement
                    attribute="free_shipping"
                    label="Display only items with free shipping"
                  />
                </template>
              </ais-panel>

              <ais-panel>
                <template slot="header">Ratings</template>

                <template slot="default">
                  <ais-rating-menu attribute="rating">
                    <ul class="ais-RatingMenu-list" slot-scope="{ items, refine, createURL }">
                      <li
                        :class="cx('ais-RatingMenu-item', {
                          'ais-RatingMenu-item--selected': items.every(item => !item.isRefined) || item.isRefined
                        })"
                        v-for="item in items"
                        :key="item.value"
                      >
                        <a
                          class="ais-RatingMenu-link"
                          :aria-label="item.value + ' & up'"
                          :href="createURL(item.value)"
                          @click.prevent="refine(item.value)"
                        >
                          <span v-for="(full, index) in item.stars" :key="index">
                            <svg
                              :class="cx('ais-RatingMenu-starIcon', {
                                'ais-RatingMenu-starIcon--full': full,
                                'ais-RatingMenu-starIcon--empty': !full,
                              })"
                              aria-hidden="true"
                              viewBox="0 0 16 16"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M10.472 5.008L16 5.816l-4 3.896.944 5.504L8 12.616l-4.944 2.6L4 9.712 0 5.816l5.528-.808L8 0z"
                              ></path>
                            </svg>
                          </span>

                          <span class="ais-RatingMenu-count">{{ item.count }}</span>
                        </a>
                      </li>
                    </ul>
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

            <ais-stats
              class="container-filters-footer-button-wrapper"
            >
              <template slot="default" slot-scope="{ nbHits }">
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
                { value: 'instant_search_price_desc', label: 'Price descending' },
              ]"
            />

            <ais-hits-per-page
              class="container-option"
              :items="[
                {
                  label: '16 hits per page',
                  value: 16,
                  default: getSelectedHitsPerPageValue() === 16 || !getSelectedHitsPerPageValue(),
                },
                {
                  label: '32 hits per page',
                  value: 32,
                  default: getSelectedHitsPerPageValue() === 32,
                },
                {
                  label: '64 hits per page',
                  value: 64,
                  default: getSelectedHitsPerPageValue() === 64,
                },
              ]"
            />
          </header>

          <ais-hits>
            <div slot="item" slot-scope="{ item }">
              <article class="hit">
                <header class="hit-image-container">
                  <img :src="item.image" :alt="item.name" class="hit-image">
                </header>

                <div class="hit-info-container">
                  <p class="hit-category">{{ item.categories[0] }}</p>
                  <h1>
                    <ais-highlight attribute="name" :hit="item"/>
                  </h1>
                  <p class="hit-description">
                    <ais-snippet attribute="description" :hit="item"/>
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
                          ></path>
                        </svg>
                        {{ item.rating }}
                      </span>
                    </p>
                  </footer>
                </div>
              </article>
            </div>
          </ais-hits>

          <no-results />

          <footer class="container-footer">
            <ais-pagination :padding="2">
              <div
                slot-scope="{
                  currentRefinement,
                  pages,
                  isFirstPage,
                  isLastPage,
                  refine,
                  createURL
                }"
                class="ais-Pagination"
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
                          <path d="M9 5H1M5 9L1 5l4-4"></path>
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
                          <path d="M9 5H1M5 9L1 5l4-4"></path>
                        </g>
                      </svg>
                    </a>
                  </li>

                  <li
                    :class="cx('ais-Pagination-item', 'ais-Pagination-item--page', {
                      'ais-Pagination-item--selected': page === currentRefinement
                    })"
                    v-for="page in pages"
                    :key="page"
                  >
                    <a
                      class="ais-Pagination-link"
                      :href="createURL(page)"
                      :style="{ fontWeight: page === currentRefinement ? 'bold' : '' }"
                      @click.prevent="refine(page)"
                    >{{ page + 1 }}</a>
                  </li>

                  <li class="ais-Pagination-item ais-Pagination-item--nextPage" v-if="!isLastPage">
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
                          <path d="M1 5h8M5 9l4-4-4-4"></path>
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
                          <path d="M1 5h8M5 9l4-4-4-4"></path>
                        </g>
                      </svg>
                    </span>
                  </li>
                </ul>
              </div>
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
import algoliasearch from 'algoliasearch/lite';
import VueSlider from 'vue-slider-component';
import cx from 'classnames';
import ClearRefinements from './widgets/ClearRefinements.vue';
import NoResults from './widgets/NoResults.vue';
import { formatNumber } from './utils';
import getRouting from './routing';

import './Theme.css';
import './App.css';
import './App.mobile.css';
import './widgets/PriceSlider.css';

export default {
  components: {
    VueSlider,
    ClearRefinements,
    NoResults
  },
  created() {
    this.onKeyUp = event => {
      if (event.key !== 'Escape') {
        return;
      }
      this.closeFilters();
    }

    this.onClick = event => {
      if (event.target !== this.header) {
        return;
      }

      this.closeFilters();
    }
  },
  mounted() {
    this.resultsContainer = document.querySelector('.container-results');
    this.header = document.querySelector('#header');
  },
  data() {
    return {
      cx,
      searchClient: algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76'
      ),
      routing: getRouting({ indexName: 'instant_search' })
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
    getSelectedHitsPerPageValue() {
      const [, hitsPerPage] = document.location.search.match(/hitsPerPage=([0-9]+)/) || [];
      return Number(hitsPerPage);
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
