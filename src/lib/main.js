// required for browsers not supporting Object.freeze (helper requirement)
import '../shams/Object.freeze.js';

// required for IE <= 10 since move to babel6
import '../shims/Object.getPrototypeOf.js';

import toFactory from 'to-factory';
import InstantSearch from './InstantSearch.js';
import algoliasearchHelper from 'algoliasearch-helper';
import clearAll from '../widgets/clear-all/clear-all.js';
import currentRefinedValues from '../widgets/current-refined-values/current-refined-values.js';
import hierarchicalMenu from '../widgets/hierarchical-menu/hierarchical-menu.js';
import hits from '../widgets/hits/hits.js';
import hitsPerPageSelector from '../widgets/hits-per-page-selector/hits-per-page-selector.js';
import menu from '../widgets/menu/menu.js';
import refinementList from '../widgets/refinement-list/refinement-list.js';
import numericRefinementList from '../widgets/numeric-refinement-list/numeric-refinement-list.js';
import numericSelector from '../widgets/numeric-selector/numeric-selector.js';
import pagination from '../widgets/pagination/pagination.js';
import priceRanges from '../widgets/price-ranges/price-ranges.js';
import searchBox from '../widgets/search-box/search-box.js';
import rangeSlider from '../widgets/range-slider/range-slider.js';
import sortBySelector from '../widgets/sort-by-selector/sort-by-selector.js';
import starRating from '../widgets/star-rating/star-rating.js';
import stats from '../widgets/stats/stats.js';
import toggle from '../widgets/toggle/toggle.js';
import version from './version.js';

const instantsearch = toFactory(InstantSearch);
instantsearch.widgets = {
  clearAll,
  currentRefinedValues,
  hierarchicalMenu,
  hits,
  hitsPerPageSelector,
  menu,
  refinementList,
  numericRefinementList,
  numericSelector,
  pagination,
  priceRanges,
  searchBox,
  rangeSlider,
  sortBySelector,
  starRating,
  stats,
  toggle
};
instantsearch.version = version;
instantsearch.createQueryString = algoliasearchHelper.url.getQueryStringFromState;

export default instantsearch;
