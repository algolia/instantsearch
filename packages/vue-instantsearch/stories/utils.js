import { createFromAlgoliaCredentials } from '../src/store';

export function defaultSearchStore() {
  const searchStore = createFromAlgoliaCredentials(
    'latency',
    '6be0576ff61c053d5f9a3225e2a90f76'
  );
  searchStore.indexName = 'instant_search';
  searchStore.queryParameters = { snippetEllipsisText: '…' };
  searchStore.start();

  return searchStore;
}

export function previewWrapper() {
  return {
    template: `
      <ais-index :search-store="searchStore">
        <h2>Display</h2>
        <story/>

        <h2>Results</h2>
        <ais-search-box></ais-search-box>
        <ais-results>
          <div slot-scope="{ result }" class="result">
            <div class="hit">
              <div>
              <div class="result-picture">
                <img :src="'https://res.cloudinary.com/hilnmyskv/image/fetch/h_100,q_100,f_auto/'+result.image">
              </div>
              </div>
              <div class="result-content">
                <div class="result-name">
                  <span v-html="result._highlightResult.name.value"></span>
                  <span> - \${{ result.price }}</span>
                  <span> - {{ result.rating }} stars</span>
                </div>
                <div class="result-type" v-html="result._highlightResult.type.value"></div>
                <div class="result-description" v-html="result._snippetResult.description.value"></div>
              </div>
            </div>
          </div>
        </ais-results>
      </ais-index>
    `,
    data() {
      return {
        searchStore: defaultSearchStore(),
      };
    },
  };
}
