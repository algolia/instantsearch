'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

require('../shams/Object.freeze.js');

require('../shims/Object.getPrototypeOf.js');

var _toFactory = require('to-factory');

var _toFactory2 = _interopRequireDefault(_toFactory);

var _InstantSearch = require('./InstantSearch.js');

var _InstantSearch2 = _interopRequireDefault(_InstantSearch);

var _algoliasearchHelper = require('algoliasearch-helper');

var _algoliasearchHelper2 = _interopRequireDefault(_algoliasearchHelper);

var _clearAll = require('../widgets/clear-all/clear-all.js');

var _clearAll2 = _interopRequireDefault(_clearAll);

var _currentRefinedValues = require('../widgets/current-refined-values/current-refined-values.js');

var _currentRefinedValues2 = _interopRequireDefault(_currentRefinedValues);

var _hierarchicalMenu = require('../widgets/hierarchical-menu/hierarchical-menu.js');

var _hierarchicalMenu2 = _interopRequireDefault(_hierarchicalMenu);

var _hits = require('../widgets/hits/hits.js');

var _hits2 = _interopRequireDefault(_hits);

var _hitsPerPageSelector = require('../widgets/hits-per-page-selector/hits-per-page-selector.js');

var _hitsPerPageSelector2 = _interopRequireDefault(_hitsPerPageSelector);

var _menu = require('../widgets/menu/menu.js');

var _menu2 = _interopRequireDefault(_menu);

var _refinementList = require('../widgets/refinement-list/refinement-list.js');

var _refinementList2 = _interopRequireDefault(_refinementList);

var _numericRefinementList = require('../widgets/numeric-refinement-list/numeric-refinement-list.js');

var _numericRefinementList2 = _interopRequireDefault(_numericRefinementList);

var _numericSelector = require('../widgets/numeric-selector/numeric-selector.js');

var _numericSelector2 = _interopRequireDefault(_numericSelector);

var _pagination = require('../widgets/pagination/pagination.js');

var _pagination2 = _interopRequireDefault(_pagination);

var _priceRanges = require('../widgets/price-ranges/price-ranges.js');

var _priceRanges2 = _interopRequireDefault(_priceRanges);

var _searchBox = require('../widgets/search-box/search-box.js');

var _searchBox2 = _interopRequireDefault(_searchBox);

var _rangeSlider = require('../widgets/range-slider/range-slider.js');

var _rangeSlider2 = _interopRequireDefault(_rangeSlider);

var _sortBySelector = require('../widgets/sort-by-selector/sort-by-selector.js');

var _sortBySelector2 = _interopRequireDefault(_sortBySelector);

var _starRating = require('../widgets/star-rating/star-rating.js');

var _starRating2 = _interopRequireDefault(_starRating);

var _stats = require('../widgets/stats/stats.js');

var _stats2 = _interopRequireDefault(_stats);

var _toggle = require('../widgets/toggle/toggle.js');

var _toggle2 = _interopRequireDefault(_toggle);

var _version = require('./version.js');

var _version2 = _interopRequireDefault(_version);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// required for IE <= 10 since move to babel6
var instantsearch = (0, _toFactory2.default)(_InstantSearch2.default); // required for browsers not supporting Object.freeze (helper requirement)

instantsearch.widgets = {
  clearAll: _clearAll2.default,
  currentRefinedValues: _currentRefinedValues2.default,
  hierarchicalMenu: _hierarchicalMenu2.default,
  hits: _hits2.default,
  hitsPerPageSelector: _hitsPerPageSelector2.default,
  menu: _menu2.default,
  refinementList: _refinementList2.default,
  numericRefinementList: _numericRefinementList2.default,
  numericSelector: _numericSelector2.default,
  pagination: _pagination2.default,
  priceRanges: _priceRanges2.default,
  searchBox: _searchBox2.default,
  rangeSlider: _rangeSlider2.default,
  sortBySelector: _sortBySelector2.default,
  starRating: _starRating2.default,
  stats: _stats2.default,
  toggle: _toggle2.default
};
instantsearch.version = _version2.default;
instantsearch.createQueryString = _algoliasearchHelper2.default.url.getQueryStringFromState;

exports.default = instantsearch;