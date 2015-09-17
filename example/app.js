// force using index because package 'main' is dist/
var instantsearch = require('../index');

var search = instantsearch({
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search'
});

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for products',
    cssClass: 'form-control'
  })
);

search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats'
  })
);

search.addWidget(
  instantsearch.widgets.indexSelector({
    container: '#index-selector',
    indices: [
      {name: 'instant_search', label: 'Most relevant'},
      {name: 'instant_search_price_asc', label: 'Lowest price'},
      {name: 'instant_search_price_desc', label: 'Highest price'}
    ],
    cssClass: 'form-control'
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      empty: require('./templates/no-results.html'),
      hit: require('./templates/hit.html')
    },
    hitsPerPage: 6
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    cssClass: 'pagination',
    maxPages: 20
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#brands',
    facetName: 'brand',
    operator: 'or',
    limit: 10,
    rootClass: 'nav nav-stacked',
    template: require('./templates/or.html')
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#price_range',
    facetName: 'price_range',
    operator: 'and',
    limit: 10,
    rootClass: 'nav nav-stacked',
    template: require('./templates/and.html')
  })
);

search.addWidget(
  instantsearch.widgets.toggle({
    container: '#free_shipping',
    facetName: 'free_shipping',
    label: 'Free Shipping',
    template: require('./templates/free_shipping.html')
  })
);

search.addWidget(
  instantsearch.widgets.menu({
    container: '#categories',
    facetName: 'categories',
    limit: 10,
    template: require('./templates/category.html')
  })
);

search.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#price',
    facetName: 'price',
    tooltips: {
      format: function(formattedValue) {
        return '$' + formattedValue;
      }
    }
  })
);

search.start();
