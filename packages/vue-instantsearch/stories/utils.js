import { createFromAlgoliaCredentials } from '../src/store';

export function defaultSearchStore() {
  const searchStore = createFromAlgoliaCredentials(
    'latency',
    '6be0576ff61c053d5f9a3225e2a90f76'
  );
  searchStore.indexName = 'ikea';
  searchStore.start();

  return searchStore;
}

export function indexWrapper() {
  return {
    template: `
      <ais-index :search-store="searchStore">
        <story/>
      </ais-index>
    `,
    data() {
      return {
        searchStore: defaultSearchStore(),
      };
    },
  };
}

export function searchBoxWrapper() {
  return {
    template: `
      <div>
        <story/>
        <ais-search-box></ais-search-box>
      </div>
    `,
  };
}

export function hitsWrapper() {
  return {
    template: `
      <div>
        <story/>
        <ais-results>
          <div slot-scope="{ result }">
            <h3 v-html="result._highlightResult.name.value"></h3>
            <div v-html="result._highlightResult.description.value"></div>
          </div>
        </ais-results>
      </div>
    `,
    data() {
      return {
        searchStore: defaultSearchStore(),
      };
    },
  };
}
