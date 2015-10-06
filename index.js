require('./shams/Object.freeze.js');

var toFactory = require('to-factory');

var InstantSearch = require('./lib/InstantSearch');
var instantsearch = toFactory(InstantSearch);

instantsearch.widgets = {
  hierarchicalMenu: require('./widgets/hierarchicalMenu'),
  hits: require('./widgets/hits'),
  indexSelector: require('./widgets/index-selector'),
  menu: require('./widgets/menu'),
  refinementList: require('./widgets/refinement-list'),
  pagination: require('./widgets/pagination'),
  searchBox: require('./widgets/search-box'),
  rangeSlider: require('./widgets/range-slider'),
  stats: require('./widgets/stats'),
  toggle: require('./widgets/toggle'),
  urlSync: require('./widgets/url-sync')
};

instantsearch.version = require('./lib/version.js');

module.exports = instantsearch;
