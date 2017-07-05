/* eslint max-len: 0 */
import algoliasearchHelper from 'algoliasearch-helper';
import toFactory from 'to-factory';

import InstantSearch from './src/lib/InstantSearch.js';
import version from './src/lib/version.js';

// import instantsearch from 'instantsearch.js';
// -> provides instantsearch object without connectors and widgets
export default Object.assign(toFactory(InstantSearch), {
  version,
  createQueryString: algoliasearchHelper.url.getQueryStringFromState,

  get widgets() {
    throw new Error(`
      You can't access to 'instantsearch.widgets' directly from the ES6 build.
      Import the widgets this way 'import {SearchBox} from "instantsearch.js"'
    `);
  },

  get connectors() {
    throw new Error(`
      You can't access to 'instantsearch.connectors' directly from the ES6 build.
      Import the connectors this way 'import {connectSearchBox} from "instantsearch.js"'
    `);
  },
});

// import { connectXXX } from 'instantsearch.js'
// -> provides every available connectors
export {default as connectClearAll} from './src/connectors/clear-all/connectClearAll.js';
export {default as connectCurrentRefinedValues} from './src/connectors/current-refined-values/connectCurrentRefinedValues.js';
export {default as connectHierarchicalMenu} from './src/connectors/hierarchical-menu/connectHierarchicalMenu.js';
export {default as connectHits} from './src/connectors/hits/connectHits.js';
export {default as connectHitsPerPage} from './src/connectors/hits-per-page/connectHitsPerPage.js';
export {default as connectInfiniteHits} from './src/connectors/infinite-hits/connectInfiniteHits.js';
export {default as connectMenu} from './src/connectors/menu/connectMenu.js';
export {default as connectNumericRefinementList} from './src/connectors/numeric-refinement-list/connectNumericRefinementList.js';
export {default as connectNumericSelector} from './src/connectors/numeric-selector/connectNumericSelector.js';
export {default as connectPagination} from './src/connectors/pagination/connectPagination.js';
export {default as connectPriceRanges} from './src/connectors/price-ranges/connectPriceRanges.js';
export {default as connectRangeSlider} from './src/connectors/range-slider/connectRangeSlider.js';
export {default as connectRefinementList} from './src/connectors/refinement-list/connectRefinementList.js';
export {default as connectSearchBox} from './src/connectors/search-box/connectSearchBox.js';
export {default as connectSortBySelector} from './src/connectors/sort-by-selector/connectSortBySelector.js';
export {default as connectStarRating} from './src/connectors/star-rating/connectStarRating.js';
export {default as connectStats} from './src/connectors/stats/connectStats.js';
export {default as connectToggle} from './src/connectors/toggle/connectToggle.js';

// import { searchBox } from 'instantsearch.js'
// -> provides every available widgets
export {default as clearAll} from './src/widgets/clear-all/clear-all.js';
export {default as currentRefinedValues} from './src/widgets/current-refined-values/current-refined-values.js';
export {default as hierarchicalMenu} from './src/widgets/hierarchical-menu/hierarchical-menu.js';
export {default as hits} from './src/widgets/hits/hits.js';
export {default as hitsPerPageSelector} from './src/widgets/hits-per-page-selector/hits-per-page-selector.js';
export {default as infiniteHits} from './src/widgets/infinite-hits/infinite-hits.js';
export {default as menu} from './src/widgets/menu/menu.js';
export {default as refinementList} from './src/widgets/refinement-list/refinement-list.js';
export {default as numericRefinementList} from './src/widgets/numeric-refinement-list/numeric-refinement-list.js';
export {default as numericSelector} from './src/widgets/numeric-selector/numeric-selector.js';
export {default as pagination} from './src/widgets/pagination/pagination.js';
export {default as priceRanges} from './src/widgets/price-ranges/price-ranges.js';
export {default as searchBox} from './src/widgets/search-box/search-box.js';
export {default as rangeSlider} from './src/widgets/range-slider/range-slider.js';
export {default as sortBySelector} from './src/widgets/sort-by-selector/sort-by-selector.js';
export {default as starRating} from './src/widgets/star-rating/star-rating.js';
export {default as stats} from './src/widgets/stats/stats.js';
export {default as toggle} from './src/widgets/toggle/toggle.js';
export {default as analytics} from './src/widgets/analytics/analytics.js';
