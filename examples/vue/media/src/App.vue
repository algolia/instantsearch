<template>
  <ais-instant-search
    :search-client="searchClient"
    index-name="movies"
    :routing="routing"
    :insights="true"
  >
    <header class="navbar">
      <img
        src="https://res.cloudinary.com/hilnmyskv/image/upload/w_100,h_100,dpr_2.0//v1461180087/logo-instantsearchjs-avatar.png"
        width="40"
      />
      <h1 class="navbar__title">You <i class="fa fa-youtube-play" /></h1>
      <ais-search-box placeholder="" />
    </header>

    <main>
      <aside>
        <ais-panel>
          <template #header>
            <h5><i class="fa fa-chevron-right" /> Genres</h5>
          </template>
          <ais-refinement-list attribute="genre" />
        </ais-panel>
        <ais-panel>
          <template #header>
            <h5><i class="fa fa-chevron-right" /> Ratings</h5>
          </template>
          <ais-rating-menu attribute="rating" />
        </ais-panel>
        <div class="thank-you">
          Data courtesy of <a href="https://www.imdb.com/">imdb.com</a>
        </div>
      </aside>

      <section class="content">
        <div class="results">
          <div class="results-header">
            <ais-stats />
          </div>
          <ais-hits>
            <template #default="{ items }">
              <div class="movies">
                <ais-state-results>
                  <template #default="{ results: { query, hits } }">
                    <p class="movies-no-results" v-show="hits.length === 0">
                      No results found matching <strong>{{ query }}</strong
                      >.
                    </p>
                  </template>
                </ais-state-results>

                <article
                  v-for="item in items"
                  :key="item.objectID"
                  class="movie"
                >
                  <div class="media">
                    <div class="media-left">
                      <div
                        class="media-object"
                        :style="`background-image: url('${item.image}');`"
                      />
                    </div>
                    <div class="media-body">
                      <h4 class="media-heading">
                        <ais-highlight attribute="title" :hit="item" />
                        <span class="media-rating">
                          <svg
                            v-for="(_, i) in 5"
                            :key="i"
                            :class="[
                              'ais-RatingMenu-starIcon',
                              i >= item.rating &&
                                'ais-RatingMenu-starIcon--empty',
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
                        </span>
                      </h4>
                      <p class="year">
                        {{ item.year }}
                      </p>
                      <p class="genre">
                        <span
                          v-for="genre in item.genre"
                          :key="genre"
                          class="badge"
                        >
                          {{ genre }}
                        </span>
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </template>
          </ais-hits>
          <ais-pagination />
        </div>
      </section>
    </main>
  </ais-instant-search>
</template>

<script>
import algoliasearch from 'algoliasearch/lite';
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
