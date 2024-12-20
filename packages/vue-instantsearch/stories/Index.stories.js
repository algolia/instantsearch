import { storiesOf } from '@storybook/vue';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

storiesOf('ais-index', module)
  .add('default', () => ({
    template: `
  <div>
    <ais-instant-search :search-client="searchClient" index-name="airbnb">
      <ais-configure :restrictSearchableAttributes="['name']"/>
      <ais-search-box />
      <div>
        <ais-hits>
          <template v-slot:item="{ item }">
            <h3><ais-highlight :hit="item" attribute="name"/></h3>
          </template>
        </ais-hits>
      </div>
      <hr />
      <ais-index index-name="instant_search">
        <ais-hits>
          <template v-slot:item="{ item }">
            <h3><ais-highlight :hit="item" attribute="name"/></h3>
          </template>
        </ais-hits>
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
      };
    },
  }))
  .add('shared and individual widgets', () => ({
    template: `
  <div>
    <ais-instant-search :search-client="searchClient" index-name="instant_search">
      <ais-search-box />
      <ais-refinement-list attribute="brand" />
      <hr />
      <ais-refinement-list attribute="categories" />
      <ais-configure
        :restrictSearchableAttributes="['name']"
        hitsPerPage="4"
      />
      <ais-hits>
        <template v-slot:item="{ item }">
          <h3><ais-highlight :hit="item" attribute="name"/></h3>
        </template>
      </ais-hits>
      <hr />
      <ais-index index-name="instant_search_rating_asc">
        <ais-refinement-list attribute="brand" />
        <ais-hits>
          <template v-slot:item="{ item }">
            <h3><ais-highlight :hit="item" attribute="name"/></h3>
          </template>
        </ais-hits>
      </ais-index>
      <ais-pagination />
    </ais-instant-search>
  </div>
  `,
    data() {
      return {
        searchClient: algoliasearch(
          'latency',
          '6be0576ff61c053d5f9a3225e2a90f76'
        ),
      };
    },
  }));
