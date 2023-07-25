import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-state-results', module)
  .addDecorator(
    previewWrapper({
      indexName: 'demo-query-rules',
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
            <div class="playground-hits-desc">
              <p>
                <ais-highlight attribute="title" :hit="item" />
              </p>
            </div>
          </li>
        </ol>
      </template>
      `,
    })
  )
  .add('default display', () => ({
    template: `<ais-state-results />`,
  }))
  .add('custom "autocomplete"', () => ({
    template: `
    <div>
      <ais-search-box />
      <ais-state-results>
        <template v-slot="{ state: { query } }">
          <ais-hits v-if="query">
            <template v-slot:item="{ item }">
              <h3
                :tabindex="0"
                @click="alert(item)"
                @keyup.enter="alert(item)"
              >
                <ais-highlight :hit="item" attribute="title"/>
              </h3>
            </template>
          </ais-hits>
        </template>
      </ais-state-results>
    </div>
    `,
    methods: {
      alert(item) {
        // eslint-disable-next-line no-alert
        alert(item.name);
      },
    },
  }))
  .add('banner', () => ({
    template: `
    <div>
      <ais-search-box />
      <p>type "documentary"</p>
      <ais-state-results>
        <template v-slot="{ results: { userData } }">
          <div>
            <img
              v-for="{ banner_img_slug: src } in userData"
              :key="src"
              :src="'https://preview.algolia.com/query-rules/' + src"
            />
          </div>
        </template>
      </ais-state-results>
    </div>
    `,
  }))
  .add('no results', () => ({
    template: `
      <div>
        <ais-search-box />
        <ais-state-results>
          <template v-slot="{ state: { query }, results: { hits } }">
            <p v-if="hits.length === 0">
              No results found for the query: <q>{{ query }}</q>
            </p>
          </template>
        </ais-state-results>
        <ais-hits />
      </div>
    `,
  }))
  .add('ssr debugger', () => ({
    template: `
      <ais-state-results>
        <template v-slot="{ state }">
          <div>
            <p>copy this to <code>findResultsState</code></p>
            <pre>{{ cleanup(state) }}</pre>
          </div>
        </template>
      </ais-state-results>
    `,
    methods: {
      cleanup(state) {
        // loop over all values of the state, keep only those which aren't empty
        return Object.fromEntries(
          Object.entries(state)
            .map(([k, v]) =>
              v === null || v === undefined || Object.keys(v).length === 0
                ? undefined
                : [k, v]
            )
            .filter(Boolean)
        );
      },
    },
  }));
