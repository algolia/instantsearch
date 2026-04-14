<template>
  <div id="root">
    <ais-instant-search
      :search-client="searchClient"
      :compositionID="compositionID"
      :routing="routing"
      :insights="true"
    >
      <ais-configure :hits-per-page.camel="20" />

      <header class="header">
        <p class="header-title">Stop looking for an item — find it.</p>
        <ais-search-box placeholder="Product, brand, color, …" />
      </header>

      <main class="container">
        <section class="container-results">
          <div v-if="feedIDs.length > 0" class="feeds-tabs">
            <button
              v-for="id in feedIDs"
              :key="id"
              class="feeds-tabs-btn"
              :class="{ 'feeds-tabs-active': id === activeTab }"
              @click="activeTab = id"
            >
              {{ id || 'All results' }}
            </button>
          </div>

          <ais-feeds search-scope="global">
            <template #default="{ feedID }">
              <div :data-feed-id="feedID" v-show="feedID === activeTab">
                <!-- products feed -->
                <ais-hits v-if="feedID === 'products'">
                  <template #item="{ item }">
                    <article class="hit">
                      <header class="hit-image-container">
                        <img :src="item.largeImage" :alt="item.title" class="hit-image" />
                      </header>
                      <div class="hit-info-container">
                        <h1><ais-highlight attribute="title" :hit="item" /></h1>
                        <p class="hit-description" v-if="item.author">{{ item.author.join(', ') }}</p>
                      </div>
                    </article>
                  </template>
                </ais-hits>

                <!-- Fashion feed -->
                <ais-hits v-else-if="feedID === 'Fashion'">
                  <template #item="{ item }">
                    <article class="hit">
                      <header class="hit-image-container">
                        <img :src="item.image" :alt="item.name" class="hit-image" />
                      </header>
                      <div class="hit-info-container">
                        <p class="hit-category">{{ item.brand }}</p>
                        <h1><ais-highlight attribute="name" :hit="item" /></h1>
                        <p class="hit-description">{{ item.price }} {{ item.currency }}</p>
                      </div>
                    </article>
                  </template>
                </ais-hits>

                <!-- Amazon feed -->
                <ais-hits v-else-if="feedID === 'Amazon'">
                  <template #item="{ item }">
                    <article class="hit">
                      <div class="hit-info-container">
                        <p class="hit-category">{{ item.product_brand }}</p>
                        <h1><ais-highlight attribute="product_title" :hit="item" /></h1>
                      </div>
                    </article>
                  </template>
                </ais-hits>

                <!-- fallback -->
                <ais-hits v-else>
                  <template #item="{ item }">
                    <article class="hit">
                      <div class="hit-info-container">
                        <h1>{{ item.objectID }}</h1>
                      </div>
                    </article>
                  </template>
                </ais-hits>
              </div>
            </template>
          </ais-feeds>

          <footer class="container-footer">
            <ais-pagination :padding="2" />
          </footer>
        </section>
      </main>
    </ais-instant-search>
  </div>
</template>

<script>
import { compositionClient } from '@algolia/composition';

import getRouting from './routing';

const multifeedCompositionID = 'comp1774447423386___products';

export default {
  data() {
    return {
      searchClient: compositionClient(
        '9HILZG6EJK',
        '65b3e0bb064c4172c4810fb2459bebd1'
      ),
      compositionID: multifeedCompositionID,
      routing: getRouting({ indexName: multifeedCompositionID }),
      activeTab: null,
      feedIDs: [],
    };
  },
  mounted() {
    this.$nextTick(() => {
      const feedsEl = this.$el.querySelector('.ais-Feeds');
      if (feedsEl) {
        new MutationObserver(() => this.syncFeedTabs()).observe(feedsEl, {
          childList: true,
          subtree: true,
        });
      }
      this.syncFeedTabs();
    });
  },
  methods: {
    syncFeedTabs() {
      const feedsEl = this.$el.querySelector('.ais-Feeds');
      if (!feedsEl) return;
      const newIDs = Array.from(
        feedsEl.querySelectorAll('[data-feed-id]')
      ).map((el) => el.dataset.feedId);
      if (newIDs.length > 0 && newIDs.join(',') !== this.feedIDs.join(',')) {
        this.feedIDs = newIDs;
        if (this.activeTab === null) {
          this.activeTab = newIDs[0];
        }
      }
    },
  },
};
</script>
