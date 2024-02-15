import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-query-rule-context', module)
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
      <ul>
        <li>On empty query, select the "Drama" category and The Shawshank Redemption appears</li>
        <li>On empty query, select the "Thriller" category and Pulp Fiction appears</li>
        <li>Type <q>music</q> and a banner will appear.</li>
      </ul>
      <ais-query-rule-context :tracked-filters="trackedFilters" />
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
    </div>`,
    data() {
      return {
        trackedFilters: {
          genre: () => ['Thriller', 'Drama'],
        },
      };
    },
  }))
  .add('with initial filter', () => ({
    template: `
    <div>
      <ul>
        <li>On empty query, select the "Drama" category and The Shawshank Redemption appears</li>
        <li>On empty query, select the "Thriller" category and Pulp Fiction appears</li>
        <li>Type <q>music</q> and a banner will appear.</li>
      </ul>
      <ais-configure
        :disjunctive-facets-refinements.camel="{
          genre: ['Drama']
        }"
      />
      <ais-query-rule-context :tracked-filters="trackedFilters" />
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
    data() {
      return {
        trackedFilters: {
          genre: () => ['Thriller', 'Drama'],
        },
      };
    },
  }))
  .add('with initial rule context', () => ({
    template: `
    <div>
      <ul>
        <li>On empty query: "The Shawshank Redemption" appears</li>
        <li>On empty query & "Thriller" category: "Pulp Fiction" appears</li>
        <li>On query <q>music</q>: "This is it" appears.</li>
      </ul>
      <ais-query-rule-context
        :tracked-filters="trackedFilters"
        :transform-rule-contexts="transformRuleContexts"
      />
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
    data() {
      return {
        trackedFilters: {
          genre: (values) => values,
        },
        transformRuleContexts: (ruleContexts) => {
          if (ruleContexts.length === 0) {
            return ['ais-genre-Drama'];
          }

          return ruleContexts;
        },
      };
    },
  }));
