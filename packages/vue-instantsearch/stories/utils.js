import algoliasearch from 'algoliasearch/lite';

export const previewWrapper =
  ({
    searchClient = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76'),
    indexName = 'instant_search',
    hits = `
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
              <ais-highlight attribute="name" :hit="item" />
            </p>
            <p>Rating: {{ item.rating }}✭</p>
            <p>Price: {{ item.price }}$</p>
          </div>
        </li>
      </ol>
    </template>
  `,
    filters = `
    <ais-refinement-list attribute="brand" />
    <ais-configure :hitsPerPage="3" />
  `,
    routing,
  } = {}) =>
  () => ({
    template: `
    <ais-instant-search
      :search-client="searchClient"
      index-name="${indexName}"
      :routing="routing"
    >
      <div class="vis-container vis-container-preview">
        <story />
      </div>

      <div class="vis-container vis-container-playground">
        <div class="panel-left">
          ${filters}
        </div>
        <div class="panel-right">
          <ais-search-box />
          <ais-stats />
          <ais-hits>
            ${hits}
          </ais-hits>
          <ais-pagination />
        </div>
      </div>
    </ais-instant-search>
  `,
    data() {
      return {
        searchClient,
        routing,
      };
    },
  });
