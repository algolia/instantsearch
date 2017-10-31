import { storiesOf } from 'dev-novel';
import { wrapWithHits } from '../utils/wrap-with-hits.js';
import * as widgets from './widgets/index.js';
import initClearAllStories from './stories/clear-all.stories';
import initCurrentRefinedValuesStories from './stories/current-refined-values.stories';
import initHierarchicalMenuStories from './stories/hierarchical-menu.stories';
import initHitsStories from './stories/hits.stories';
import initHitsPerPageSelectorStories from './stories/hits-per-page-selector.stories';
import initInfiniteHitsStories from './stories/infinite-hits.stories';
import initMenuStories from './stories/menu.stories';
import initNumericRefinementListStories from './stories/numeric-refinement-list.stories';
import initNumericSelectorStories from './stories/numeric-selector.stories';
import initPaginationStories from './stories/pagination.stories';
import initPriceRangesStories from './stories/price-ranges.stories';
import initRefinementListStories from './stories/refinement-list.stories';
import initSearchBoxStories from './stories/search-box.stories';
import initSortBySelectorStories from './stories/sort-by-selector.stories';
import initStarRatingStories from './stories/star-rating.stories';

// transform `container` to jQuery object
const wrap = fn => wrapWithHits(container => fn(window.$(container)));

export default () => {
  initClearAllStories();
  initCurrentRefinedValuesStories();
  initHierarchicalMenuStories();
  initHitsStories();
  initHitsPerPageSelectorStories();
  initInfiniteHitsStories();
  initMenuStories();
  initNumericRefinementListStories();
  initNumericSelectorStories();
  initPaginationStories();
  initPriceRangesStories();
  initRefinementListStories();
  initSearchBoxStories();
  initSortBySelectorStories();
  initStarRatingStories();

  storiesOf('Stats').add(
    'default',
    wrap(containerNode => {
      window.search.addWidget(widgets.stats({ containerNode }));
    })
  );

  storiesOf('Toggle').add(
    'default',
    wrap(containerNode => {
      window.search.addWidget(
        widgets.toggle({
          containerNode,
          attributeName: 'free_shipping',
          label: 'Free Shipping (toggle single value)',
          title: 'Free Shipping',
        })
      );
    })
  );
};
