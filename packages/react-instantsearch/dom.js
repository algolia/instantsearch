import createInstantSearch from './src/core/createInstantSearch';
import createIndex from './src/core/createIndex';
import algoliasearch from 'algoliasearch/lite';

const InstantSearch = createInstantSearch(algoliasearch, {
  Root: 'div',
  props: { className: 'ais-InstantSearch__root' },
});
export { InstantSearch };
const Index = createIndex({
  Root: 'div',
  props: { className: 'ais-MultiIndex__root' },
});
export { Index };
export { default as Configure } from './src/widgets/Configure.js';
export {
  default as CurrentRefinements,
} from './src/widgets/CurrentRefinements.js';
export { default as HierarchicalMenu } from './src/widgets/HierarchicalMenu.js';
export { default as Highlight } from './src/widgets/Highlight.js';
export { default as Snippet } from './src/widgets/Snippet.js';
export { default as Hits } from './src/widgets/Hits.js';
export { default as HitsPerPage } from './src/widgets/HitsPerPage.js';
export { default as InfiniteHits } from './src/widgets/InfiniteHits.js';
export { default as Menu } from './src/widgets/Menu.js';
export { default as MenuSelect } from './src/widgets/MenuSelect.js';
export { default as NumericMenu } from './src/widgets/NumericMenu.js';
export { default as Pagination } from './src/widgets/Pagination.js';
export { default as PoweredBy } from './src/widgets/PoweredBy.js';
export { default as RangeInput } from './src/widgets/RangeInput.js';
export { default as RangeSlider } from './src/widgets/RangeSlider.js';
export { default as RatingMenu } from './src/widgets/RatingMenu.js';
export { default as RefinementList } from './src/widgets/RefinementList.js';
export { default as ClearRefinements } from './src/widgets/ClearRefinements.js';
export { default as ScrollTo } from './src/widgets/ScrollTo.js';
export { default as SearchBox } from './src/widgets/SearchBox.js';
export { default as SortBy } from './src/widgets/SortBy.js';
export { default as Stats } from './src/widgets/Stats.js';
export { default as ToggleRefinement } from './src/widgets/ToggleRefinement.js';
export { default as Panel } from './src/widgets/Panel.js';
export { default as Breadcrumb } from './src/widgets/Breadcrumb';
