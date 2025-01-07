import { storiesOf } from '@storybook/vue';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

class FakeClient {
  // eslint-disable-next-line require-await
  async search() {
    const hits = Array.from({ length: 10 }, (_, i) => ({
      objectID: `object ${i}`,
      name: `this is random object #${i}`,
      _highlightResult: {
        name: {
          value: `this is random object #${i}`,
        },
      },
    }));

    return {
      results: [
        {
          hits,
        },
      ],
    };
  }
}

const clients = {
  working: algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76'),
  fake: new FakeClient(),
};

storiesOf('ais-instant-search', module)
  .add('simple usage', () => ({
    template: `
      <ais-instant-search
        index-name="instant_search"
        :search-client="searchClient"
      >
        <p>This is inside a <code>ais-instant-search</code></p>
        <ais-search-box />
        <ais-hits />
      </ais-instant-search>
    `,
    data() {
      return {
        searchClient: clients.working,
      };
    },
  }))
  .add('dynamically changing the changeable props', () => ({
    template: `
      <div>
        <form>
          <label>index-name: <input v-model="indexName"/></label>
          <fieldset>
            <legend>search client</legend>
            <input type="radio" id="working-client" value="working" v-model="searchClientName">
            <label for="working-client">working</label>
            <input type="radio" id="fake-client" value="fake" v-model="searchClientName">
            <label for="fake-client">fake</label>
          </fieldset>
          <label>
            stalled-search-delay:
            <input v-model.number="stalledSearchDelay" type="number"/>
          </label>
        </form>
        <ais-instant-search
          :index-name="indexName"
          :search-client="searchClient"
          :stalled-search-delay="stalledSearchDelay"
        >
          <p>This is inside a <code>ais-instant-search</code>: <code>{{indexName}}</code></p>
          <ais-search-box show-loading-indicator/>
          <ais-hits>
            <template v-slot:item="{item}">
              <p><ais-highlight :hit="item" attribute="name"/></p>
            </template>
          </ais-hits>
        </ais-instant-search>
      </div>
    `,
    data() {
      return {
        searchClientName: 'working',
        searchClient: clients.working,
        stalledSearchDelay: undefined,
        indexName: 'instant_search',
      };
    },
    watch: {
      searchClientName(newName) {
        this.searchClientName = newName;
        this.searchClient = clients[newName];
      },
    },
  }));
