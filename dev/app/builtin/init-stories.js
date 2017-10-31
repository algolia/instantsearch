/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearch from '../../../index.js';
import wrapWithHits from '../utils/wrap-with-hits.js';
import initInstantSearchStories from './stories/instantsearch.stories';
import initAnalyticsStories from './stories/analytics.stories';
import initClearAllStories from './stories/clear-all.stories';
import initCurrentRefinedValuesStories from './stories/current-refined-values.stories';
import initHierarchicalMenu from './stories/hierarchical-menu.stories';
import initHitsStories from './stories/hits.stories';
import initHitsPerPageSelectorStories from './stories/hits-per-page-selector.stories';
import initInfiniteHitsStories from './stories/infinite-hits.stories';
import initMenuStories from './stories/menu.stories';
import initNumericRefinementListStories from './stories/numeric-refinement-list.stories';
import initNumericSelectorStories from './stories/numeric-selector.stories';
import initPaginationStories from './stories/pagination.stories';
import initPriceRangesStories from './stories/price-ranges.stories';
import initRangeSliderStories from './stories/range-slider.stories';
import initRefinementListStories from './stories/refinement-list.stories';
import initSearchBoxStories from './stories/search-box.stories';
import initSortBySelectorStories from './stories/sort-by-selector.stories';
import initStarRatingStories from './stories/star-rating.stories';
import initStatsStories from './stories/stats.stories';

export default () => {
  initInstantSearchStories();
  initAnalyticsStories();
  initClearAllStories();
  initCurrentRefinedValuesStories();
  initHierarchicalMenu();
  initHitsStories();
  initHitsPerPageSelectorStories();
  initInfiniteHitsStories();
  initMenuStories();
  initNumericRefinementListStories();
  initNumericSelectorStories();
  initPaginationStories();
  initPriceRangesStories();
  initRangeSliderStories();
  initRefinementListStories();
  initSearchBoxStories();
  initSortBySelectorStories();
  initStatsStories();
  initStarRatingStories();

  storiesOf('Toggle')
    .add(
      'with single value',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.toggle({
            container,
            attributeName: 'free_shipping',
            label: 'Free Shipping (toggle single value)',
            templates: {
              header: 'Shipping',
            },
          })
        );
      })
    )
    .add(
      'with on & off values',
      wrapWithHits(container => {
        window.search.addWidget(
          instantsearch.widgets.toggle({
            container,
            attributeName: 'brand',
            label: 'Canon (not checked) or sony (checked)',
            values: {
              on: 'Sony',
              off: 'Canon',
            },
            templates: {
              header: 'Google or amazon (toggle two values)',
            },
          })
        );
      })
    );
};
