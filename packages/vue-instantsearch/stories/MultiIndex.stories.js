import { storiesOf } from '@storybook/vue';
import algoliasearch from 'algoliasearch';

storiesOf('MultiIndex', module).add('simple usage', () => ({
  template: `
  <div>
    <ais-index :search-client="searchClient" index-name="ikea">
      <ais-search-box v-model="query"/>
      <ais-configure :restrictSearchableAttributes="['name']"/>
      <ais-hits>
        <template slot="item" slot-scope="{ item }">
          <h3><ais-highlight :hit="item" attribute="name"/></h3>
        </template>
      </ais-hits>
    </ais-index>
    <hr />
    <ais-index :search-client="searchClient" index-name="instant_search">
      <ais-search-box v-model="query" hidden/>
      <ais-configure :restrictSearchableAttributes="['name']"/>
      <ais-hits>
        <template slot="item" slot-scope="{ item }">
          <h3><ais-highlight :hit="item" attribute="name"/></h3>
        </template>
      </ais-hits>
    </ais-index>
  </div>
  `,
  data() {
    return {
      query: '',
      searchClient: algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76',
        {
          // this is necessary, because we call the same refine 2 times?
          _useRequestCache: true,
        }
      ),
    };
  },
}));
