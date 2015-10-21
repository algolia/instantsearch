var React = require('react');

require('./shams/Object.freeze.js');

var toFactory = require('to-factory');

var InstantSearch = require('./lib/InstantSearch');
var instantsearch = toFactory(InstantSearch);

instantsearch.widgets = {
  hierarchicalMenu: require('./widgets/hierarchical-menu/hierarchical-menu.js'),
  hits: require('./widgets/hits/hits'),
  indexSelector: require('./widgets/index-selector/index-selector'),
  menu: require('./widgets/menu/menu.js'),
  refinementList: require('./widgets/refinement-list/refinement-list.js'),
  pagination: require('./widgets/pagination/pagination'),
  searchBox: require('./widgets/search-box'),
  rangeSlider: require('./widgets/range-slider/range-slider'),
  stats: require('./widgets/stats/stats'),
  toggle: require('./widgets/toggle/toggle')
};

instantsearch.version = require('./lib/version.js');

module.exports = instantsearch;
