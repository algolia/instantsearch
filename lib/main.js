// required for browsers not supporting this
require('../shams/Object.freeze.js');

let toFactory = require('to-factory');

let InstantSearch = require('./InstantSearch');
let instantsearch = toFactory(InstantSearch);
let algoliasearchHelper = require('algoliasearch-helper');

instantsearch.widgets = {
  clearAll: require('../widgets/clear-all/clear-all.js'),
  hierarchicalMenu: require('../widgets/hierarchical-menu/hierarchical-menu.js'),
  hits: require('../widgets/hits/hits'),
  hitsPerPageSelector: require('../widgets/hits-per-page-selector/hits-per-page-selector'),
  menu: require('../widgets/menu/menu.js'),
  refinementList: require('../widgets/refinement-list/refinement-list.js'),
  numericRefinementList: require('../widgets/numeric-refinement-list/numeric-refinement-list.js'),
  numericSelector: require('../widgets/numeric-selector/numeric-selector.js'),
  pagination: require('../widgets/pagination/pagination'),
  priceRanges: require('../widgets/price-ranges/price-ranges.js'),
  searchBox: require('../widgets/search-box/search-box'),
  rangeSlider: require('../widgets/range-slider/range-slider'),
  sortBySelector: require('../widgets/sort-by-selector/sort-by-selector'),
  starRating: require('../widgets/star-rating/star-rating'),
  stats: require('../widgets/stats/stats'),
  toggle: require('../widgets/toggle/toggle')
};

instantsearch.version = require('./version.js');

instantsearch.createQueryString = algoliasearchHelper.url.getQueryStringFromState;

module.exports = instantsearch;
