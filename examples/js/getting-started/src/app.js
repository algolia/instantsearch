import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { configure, hits, index, searchBox } from 'instantsearch.js/es/widgets';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  future: {
    preserveSharedStateOnUnmount: true,
  },
});

const trendingFacets = connectTrendingFacets(({ items, widgetOptions }) => {
  const container = document.querySelector(widgetOptions.container);
  container.innerHTML = '';
  container.insertAdjacentHTML(
    'beforeend',
    `<div><h3>Trending facets</h3><ul></ul></div>`
  );
  items.forEach((item) => {
    container.querySelector('ul').insertAdjacentHTML(
      'beforeend',
      `<li>
          <p style="margin-left: 1rem">${item.facetValue}</p>
          </li>`
    );
  });
});

const frequentlyBoughtTogether = connectFrequentlyBoughtTogether(
  ({ items, widgetOptions }) => {
    const container = document.querySelector(widgetOptions.container);
    container.innerHTML = '';
    container.insertAdjacentHTML(
      'beforeend',
      `<div><h3>Frequently Bought Together</h3><ul></ul></div>`
    );
    items.forEach((item) => {
      container.querySelector('ul').insertAdjacentHTML(
        'beforeend',
        `<li>
          <p style="margin-left: 1rem">${item.name || item.title}</p>
          </li>`
      );
    });
  }
);

search.addWidgets([
  trendingFacets({
    container: '#trending',
    facetName: 'categories',
    maxRecommendations: 5,
  }),
  frequentlyBoughtTogether({
    container: '#fbt1',
    objectIDs: ['5723537', '5005506'],
    maxRecommendations: 3,
  }),
  index({ indexName: 'devcon22_bm_products' }).addWidgets([
    frequentlyBoughtTogether({
      container: '#fbt2',
      objectIDs: ['90807', '91789'],
      maxRecommendations: 4,
    }),
  ]),
]);

search.start();

function connectTrendingFacets(renderFn, unmountFn = () => {}) {
  return function _trendingFacets(widgetOptions) {
    return {
      $$type: 'ais.trendingFacets',
      dependsOn: 'recommend',
      init(initOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },
      render(renderOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },
      dispose() {
        unmountFn();
      },
      getRenderState(renderState) {
        return renderState;
      },
      getWidgetRenderState({ results }) {
        console.log('\t trendingFacets', results);

        return {
          items: results?.length > 0 ? results[0].hits : [],
          widgetOptions,
        };
      },
      getWidgetParameters(state) {
        const { container: _container, ...options } = widgetOptions;
        return state.addTrendingFacets({ ...options });
      },
    };
  };
}

function connectFrequentlyBoughtTogether(renderFn, unmountFn = () => {}) {
  return function _trendingFacets(widgetOptions) {
    return {
      $$type: 'ais.frequentlyBoughtTogether',
      dependsOn: 'recommend',
      init(initOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },
      render(renderOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },
      dispose() {
        unmountFn();
      },
      getRenderState(renderState) {
        return renderState;
      },
      getWidgetRenderState({ results }) {
        console.log('\t frequentlyBoughtTogether', results);

        return {
          items: results?.length > 0 ? results[0].hits : [],
          widgetOptions,
        };
      },
      getWidgetParameters(state) {
        const { container: _container, objectIDs, ...options } = widgetOptions;
        return objectIDs.reduce(
          (acc, objectID) => acc.addRelatedProducts({ objectID, ...options }),
          state
        );
      },
    };
  };
}
