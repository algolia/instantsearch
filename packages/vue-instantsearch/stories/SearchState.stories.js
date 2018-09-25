import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('ais-search-state', module)
  .addDecorator(
    previewWrapper({
      indexName: 'demo-query-rules',
      filters: '',
      hits: `
      <ol
        slot-scope="{ items }"
        class="playground-hits"
      >
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
      `,
    })
  )
  .add('default display', () => ({
    template: `<ais-search-state></ais-search-state>`,
  }))
  .add('custom "autocomplete"', () => ({
    template: `
    <div>
      <ais-search-box />
      <ais-search-state>
        <template slot-scope="{ query }">
          <ais-hits v-if="query">
            <h3
              slot="item"
              slot-scope="{ item }"
              :tabindex="0"
              @click="alert(item)"
              @keyup.enter="alert(item)"
            >
              <ais-highlight :hit="item" attribute="title"/>
            </h3>
          </ais-hits>
        </template>
      </ais-search-state>
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
      <ais-search-state>
        <template slot-scope="{ userData }">
          <div>
            <img
              v-for="{ banner_img_slug: src } in userData"
              :key="src"
              :src="'https://preview.algolia.com/query-rules/' + src"
            />
          </div>
        </template>
      </ais-search-state>
    </div>
    `,
  }))
  .add('no results', () => ({
    template: `
      <div>
        <ais-search-box />
        <ais-hits />
        <ais-search-state>
          <template slot-scope="{ query, hits }">
            <p v-if="hits.length === 0">
              No results found for the query: <q>{{ query }}</q>
            </p>
          </template>
        </ais-search-state>
      </div>
    `,
  }));
