import { storiesOf } from '@storybook/vue';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

storiesOf('ais-configure-related-items', module).add('default', () => ({
  template: `
  <div>
    <ais-instant-search :search-client="searchClient" index-name="instant_search">
      <ais-index index-name="instant_search">
        <ais-configure :hitsPerPage="1"/>
        <ais-search-box />

        <ais-hits>
          <template v-slot:item="{ item }">
            <div :ref="setReferenceHit(item)">
              <div
                class="playground-hits-image"
                :style="{ backgroundImage: 'url(' + item.image + ')' }"
              />
              <div class="playground-hits-desc">
                <p>
                  <ais-highlight attribute="name" :hit="item" />
                </p>
                <p>Rating: {{ item.rating }}✭</p>
                <p>Price: {{ item.price }}$</p>
              </div>
            </div>
          </template>
        </ais-hits>
      </ais-index>

      <ais-index index-name="instant_search" v-if="hit">
        <h2>Related items</h2>

        <ais-configure :hitsPerPage="4"/>
        <ais-experimental-configure-related-items :hit="hit" :matchingPatterns="matchingPatterns" />

        <div class="related-items">
          <ais-pagination>
            <template v-slot="{ currentRefinement, isFirstPage, refine }">
              <div>
                <button
                  class="ais-RelatedHits-button"
                  :disabled="isFirstPage"
                  @click="refine(currentRefinement - 1)"
                >
                  ←
                </button>
              </div>
            </template>
          </ais-pagination>

          <ais-hits>
            <template v-slot:item="{ item }">
              <div class="ais-RelatedHits-item-image">
                <img :src="item.image" alt="item.name" />
              </div>
              <div class="ais-RelatedHits-item-title">
                <h4>
                  <ais-highlight attribute="name" :hit="item" />
                </h4>
              </div>
            </template>
          </ais-hits>

          <ais-pagination>
            <template v-slot="{ currentRefinement, isLastPage, refine }">
              <div>
                <button
                  class="ais-RelatedHits-button"
                  :disabled="isLastPage"
                  @click="refine(currentRefinement + 1)"
                >
                  →
                </button>
              </div>
            </template>
          </ais-pagination>
        </div>
      </ais-index>
    </ais-instant-search>
  </div>
  `,
  data() {
    return {
      searchClient: algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76'
      ),
      hit: null,
      matchingPatterns: {
        brand: { score: 3 },
        type: { score: 10 },
        categories: { score: 2 },
      },
    };
  },
  methods: {
    setReferenceHit(item) {
      if (!this.hit || this.hit.objectID !== item.objectID) {
        this.hit = item;
      }
    },
  },
}));
