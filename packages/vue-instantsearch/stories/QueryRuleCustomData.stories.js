import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-query-rule-custom-data', module)
  .addDecorator(
    previewWrapper({
      indexName: 'instant_search_movies',
      filters: '<ais-refinement-list attribute="genre" />',
      hits: `
      <template v-slot="{ items }">
        <ol class="playground-hits">
          <li
            v-for="item in items"
            :key="item.objectID"
            class="playground-hits-item"
          >
            <div
              class="playground-hits-image"
              :style="{ backgroundImage: 'url(' + item.image + ')' }"
            />
            <article>
              <header>
                <strong><ais-highlight attribute="title" :hit="item"/></strong>
              </header>
            </article>
          </li>
        </ol>
      </template>
      `,
    })
  )
  .add('default', () => ({
    template: `
    <div>
      <ul
        <li>On query <q>music</q>: "This is it" appears.</li>
      </ul>
      <ais-query-rule-custom-data>
        <template v-slot:item="{ item }">
          <h2>{{ item.title }}</h2>
          <a :href="item.link">
            <img
              :src="item.banner"
              :alt="item.title"
              :style="{ width: '100%' }"
            />
          </a>
        </template>
      </ais-query-rule-custom-data>
    </div>
    `,
  }))
  .add('with default banner', () => ({
    template: `
    <div>
      <ul>
        <li>On query <q>music</q>: "This is it" appears.</li>
        <li>On any other query: "Kill Bill" appears.</li>
      </ul>
      <ais-query-rule-custom-data :transform-items="transformItems">
        <template v-slot:item="{ item }">
          <h2>{{ item.title }}</h2>
          <a :href="item.link">
            <img
              :src="item.banner"
              :alt="item.title"
              :style="{ width: '100%' }"
            />
          </a>
        </template>
      </ais-query-rule-custom-data>
    </div>
    `,
    data() {
      return {
        transformItems: (items) => {
          if (items.length > 0) {
            return items.filter((item) => Boolean(item.banner));
          }

          return [
            {
              title: 'Kill Bill',
              banner: 'http://static.bobatv.net/IMovie/mv_2352/poster_2352.jpg',
              link: 'https://www.netflix.com/title/60031236',
            },
          ];
        },
      };
    },
  }))
  .add('picking first with transform', () => ({
    template: `
    <div>
      <ul>
        <li>On query <q>music</q>: "This is it" appears.</li>
        <li>On empty query, select the "Drama" category and The Shawshank Redemption appears</li>
        <li>On empty query, select the "Thriller" category and Pulp Fiction appears</li>
        <li>Only one will be visible at the same time</li>
      </ul>
      <ais-query-rule-context :tracked-filters="trackedFilters" />
      <ais-query-rule-custom-data
        :transform-items="transformItems"
      />
    </div>`,
    data() {
      return {
        transformItems: (items) => [items[0]],
        trackedFilters: {
          genre: () => ['Thriller', 'Drama'],
        },
      };
    },
  }))
  .add('keeping only banners with transform', () => ({
    template: `
    <div>
      <ul>
        <li>On query <q>music</q>: "This is it" appears.</li>
      </ul>
      <ais-query-rule-custom-data
        :transform-items="transformItems"
      />
    </div>`,
    data() {
      return {
        transformItems: (items) => items.filter((item) => Boolean(item.banner)),
      };
    },
  }));
