import { deprecate } from '../lib/utils';

import connectAnswers from './answers/connectAnswers';
import connectConfigureRelatedItems from './configure-related-items/connectConfigureRelatedItems';
import connectDynamicWidgets from './dynamic-widgets/connectDynamicWidgets';

/** @deprecated answers is no longer supported */
export const EXPERIMENTAL_connectAnswers = deprecate(
  connectAnswers,
  'answers is no longer supported'
);

/** @deprecated use connectRelatedItems instead */
export const EXPERIMENTAL_connectConfigureRelatedItems = deprecate(
  connectConfigureRelatedItems,
  'EXPERIMENTAL_connectConfigureRelatedItems is deprecated and will be removed in a next minor version of InstantSearch. Please use connectRelatedItems instead.'
);

/** @deprecated use connectDynamicWidgets */
export const EXPERIMENTAL_connectDynamicWidgets = deprecate(
  connectDynamicWidgets,
  'use connectDynamicWidgets'
);

export { connectDynamicWidgets };

export { default as connectClearRefinements } from './clear-refinements/connectClearRefinements';
export { default as connectCurrentRefinements } from './current-refinements/connectCurrentRefinements';
export { default as connectFilterSuggestions } from './filter-suggestions/connectFilterSuggestions';
export { default as connectHierarchicalMenu } from './hierarchical-menu/connectHierarchicalMenu';
export { default as connectHits } from './hits/connectHits';
export { default as connectHitsWithInsights } from './hits/connectHitsWithInsights';
export { default as connectHitsPerPage } from './hits-per-page/connectHitsPerPage';
export { default as connectInfiniteHits } from './infinite-hits/connectInfiniteHits';
export { default as connectInfiniteHitsWithInsights } from './infinite-hits/connectInfiniteHitsWithInsights';
export { default as connectMenu } from './menu/connectMenu';
export { default as connectNumericMenu } from './numeric-menu/connectNumericMenu';
export { default as connectPagination } from './pagination/connectPagination';
export { default as connectPromptSuggestions } from './prompt-suggestions/connectPromptSuggestions';
export { default as connectRange } from './range/connectRange';
export { default as connectRefinementList } from './refinement-list/connectRefinementList';
export { default as connectRelatedProducts } from './related-products/connectRelatedProducts';
export { default as connectSearchBox } from './search-box/connectSearchBox';
export { default as connectSortBy } from './sort-by/connectSortBy';
export { default as connectRatingMenu } from './rating-menu/connectRatingMenu';
export { default as connectStats } from './stats/connectStats';
export { default as connectToggleRefinement } from './toggle-refinement/connectToggleRefinement';
export { default as connectTrendingItems } from './trending-items/connectTrendingItems';
export { default as connectBreadcrumb } from './breadcrumb/connectBreadcrumb';
export { default as connectGeoSearch } from './geo-search/connectGeoSearch';
export { default as connectPoweredBy } from './powered-by/connectPoweredBy';
export { default as connectConfigure } from './configure/connectConfigure';
export { default as connectAutocomplete } from './autocomplete/connectAutocomplete';
export { default as connectQueryRules } from './query-rules/connectQueryRules';
export { default as connectVoiceSearch } from './voice-search/connectVoiceSearch';
export { default as connectRelevantSort } from './relevant-sort/connectRelevantSort';
export { default as connectFrequentlyBoughtTogether } from './frequently-bought-together/connectFrequentlyBoughtTogether';
export { default as connectLookingSimilar } from './looking-similar/connectLookingSimilar';

export const connectChat = () => {
  throw new Error(
    `"connectChat" is not available from the UMD build.

Please use InstantSearch.js with a packaging system:
https://www.algolia.com/doc/guides/building-search-ui/installation/js/#with-a-packaging-system`
  );
};
