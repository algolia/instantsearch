const {instantsearch} = window;

const search = instantsearch({
  appId: 'latency',
  apiKey: '3d9875e51fbd20c7754e65422f7ce5e1',
  indexName: 'bestbuy',
  urlSync: true,
});

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      empty: 'No results',
      item: '<div class="product-picture"><img src="{{{image}}}" /></div> ' +
            '<div class="desc">{{{_highlightResult.name.value}}}</div>' +
            '<div class="sale-price">$ {{{salePrice}}}</div>',
    },
  })
);

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for products',
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#refinement-list',
    attributeName: 'category',
    templates: {
      header: 'Refine by',
    },
    autoHideContainer: false,
  })
);

search.addWidget(
  instantsearch.widgets.currentRefinedValues({
    container: '#current-refined-values',
    // This widget can also contain a clear all link to remove all filters,
    // we disable it in this example since we use `clearAll` widget on its own.
    clearAll: false,
  })
);

search.addWidget(
  instantsearch.widgets.clearAll({
    container: '#clear-all',
    templates: {
      link: 'Clear all filters',
    },
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    maxPages: 10,
    scrollTo: true,
  })
);

search.start();
