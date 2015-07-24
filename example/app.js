var instantsearch = require('../');

var instant = new instantsearch.instantsearch(
  'JTH1JDTDFT',
  '34a4c1b994546fbec45a670a06ba0c33',
  'Bibliotheques'
);

instant.addWidget(instantsearch.widgets.searchbox({
  container: '#search-box',
  placeholder: 'Search for libraries in France...'
}));

instant.addWidget(instantsearch.widgets.results({
  container: '#hits',
  templates: {
    noResults: require('./templates/no-results.html'),
    hit: require('./templates/hit.html')
  }
}));

instant.start();
