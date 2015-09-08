var toFactory = require('to-factory');

var InstantSearch = require('./lib/InstantSearch');
var instantsearch = toFactory(InstantSearch);

instantsearch.widgets = {
  hits: require('./widgets/hits'),
  indexSelector: require('./widgets/index-selector'),
  menu: require('./widgets/menu'),
  refinementList: require('./widgets/refinement-list'),
  pagination: require('./widgets/pagination'),
  searchBox: require('./widgets/search-box'),
  stats: require('./widgets/stats'),
  toggle: require('./widgets/toggle')
};

module.exports = instantsearch;
