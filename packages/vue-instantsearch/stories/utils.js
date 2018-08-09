export const previewWrapper = ({
  indexName = 'instant_search',
  hits = `
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
          <p>{{ item.name }}</p>
          <p>Rating: {{ item.rating }}✭</p>
          <p>Price: {{ item.price }}$</p>
        </div>
      </li>
    </ol>
  `,
} = {}) => () => ({
  template: `
    <ais-index
      appId="latency"
      apiKey="6be0576ff61c053d5f9a3225e2a90f76"
      indexName="${indexName}"
    >
      <ais-configure :hitsPerPage="3" />
      <div class="container container-preview">
        <story />
      </div>

      <div class="container container-playground">
        <ais-search-box />
        <ais-hits>
          ${hits}
        </ais-hits>
        <ais-pagination />
      </div>
    </ais-index>
  `,
});
