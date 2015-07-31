require('./style.css');

var instantsearch = require('../');

var instant = new instantsearch.InstantSearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76',
  'bestbuy'
);

instant.addWidget(instantsearch.widgets.searchbox({
  container: '#search-box',
  placeholder: 'Search for products in France...'
}));

instant.addWidget(instantsearch.widgets.results({
  container: '#hits',
  templates: {
    noResults: require('./templates/no-results.html'),
    hit: require('./templates/hit.html')
  }
}));

instant.start();
