require('./style.css');

var instantsearch = require('../');

var search = new instantsearch.InstantSearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76',
  'bestbuy'
);

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for products',
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
    hitsPerPage: 5
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    cssClass: 'pagination',
    maxPages: 20
  })
);

search.start();
