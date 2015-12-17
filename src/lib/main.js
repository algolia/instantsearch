// required for browsers not supporting this
import '../shams/Object.freeze.js';

import toFactory from 'to-factory';

import InstantSearch from './InstantSearch.js';
let instantsearch = toFactory(InstantSearch);
import algoliasearchHelper from 'algoliasearch-helper';

instantsearch.widgets = {
  clearAll: require('../widgets/clear-all/clear-all.js'),
  currentRefinedValues: require('../widgets/current-refined-values/current-refined-values.js'),
  hierarchicalMenu: require('../widgets/hierarchical-menu/hierarchical-menu.js'),
  hits: require('../widgets/hits/hits.js'),
  hitsPerPageSelector: require('../widgets/hits-per-page-selector/hits-per-page-selector.js'),
  menu: require('../widgets/menu/menu.js'),
  refinementList: require('../widgets/refinement-list/refinement-list.js'),
  numericRefinementList: require('../widgets/numeric-refinement-list/numeric-refinement-list.js'),
  numericSelector: require('../widgets/numeric-selector/numeric-selector.js'),
  pagination: require('../widgets/pagination/pagination.js'),
  priceRanges: require('../widgets/price-ranges/price-ranges.js'),
  searchBox: require('../widgets/search-box/search-box.js'),
  rangeSlider: require('../widgets/range-slider/range-slider.js'),
  sortBySelector: require('../widgets/sort-by-selector/sort-by-selector.js'),
  starRating: require('../widgets/star-rating/star-rating.js'),
  stats: require('../widgets/stats/stats.js'),
  toggle: require('../widgets/toggle/toggle.js')
};

instantsearch.version = require('./version.js');

instantsearch.createQueryString = algoliasearchHelper.url.getQueryStringFromState;

export default instantsearch;
