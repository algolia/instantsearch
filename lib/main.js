// required for browsers not supporting this
require('../shams/Object.freeze.js');

var toFactory = require('to-factory');

var InstantSearch = require('./InstantSearch');
var instantsearch = toFactory(InstantSearch);

instantsearch.widgets = {
  hierarchicalMenu: require('../widgets/hierarchical-menu/hierarchical-menu.js'),
  hits: require('../widgets/hits/hits'),
  hitsPerPageSelector: require('../widgets/hits-per-page-selector/hits-per-page-selector'),
  indexSelector: require('../widgets/index-selector/index-selector'),
  menu: require('../widgets/menu/menu.js'),
  refinementList: require('../widgets/refinement-list/refinement-list.js'),
  pagination: require('../widgets/pagination/pagination'),
  priceRanges: require('../widgets/price-ranges/price-ranges.js'),
  searchBox: require('../widgets/search-box/search-box'),
  rangeSlider: require('../widgets/range-slider/range-slider'),
  stats: require('../widgets/stats/stats'),
  toggle: require('../widgets/toggle/toggle')
};

instantsearch.version = require('./version.js');

instantsearch.__React = require('react');

module.exports = instantsearch;
