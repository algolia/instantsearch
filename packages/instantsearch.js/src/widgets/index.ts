import { autocomplete } from './autocomplete/autocomplete';
import dynamicWidgets from './dynamic-widgets/dynamic-widgets';

export { dynamicWidgets };

export { autocomplete };
export { default as breadcrumb } from './breadcrumb/breadcrumb';
export { default as clearRefinements } from './clear-refinements/clear-refinements';
export { default as configure } from './configure/configure';
export { default as currentRefinements } from './current-refinements/current-refinements';
export { default as feeds } from './feeds/feeds';
export { default as geoSearch } from './geo-search/geo-search';
export { default as hierarchicalMenu } from './hierarchical-menu/hierarchical-menu';
export { default as hits } from './hits/hits';
export { default as hitsPerPage } from './hits-per-page/hits-per-page';
export { index } from 'instantsearch-core/internal';
export type { IndexWidget } from 'instantsearch-core';
export { default as infiniteHits } from './infinite-hits/infinite-hits';
export { default as menu } from './menu/menu';
export { default as menuSelect } from './menu-select/menu-select';
export { default as numericMenu } from './numeric-menu/numeric-menu';
export { default as pagination } from './pagination/pagination';
export { default as panel } from './panel/panel';
export { default as poweredBy } from './powered-by/powered-by';
export { default as queryRuleContext } from './query-rule-context/query-rule-context';
export { default as queryRuleCustomData } from './query-rule-custom-data/query-rule-custom-data';
export { default as relatedProducts } from './related-products/related-products';
export { default as rangeInput } from './range-input/range-input';
export { default as rangeSlider } from './range-slider/range-slider';
export { default as ratingMenu } from './rating-menu/rating-menu';
export { default as refinementList } from './refinement-list/refinement-list';
export { default as relevantSort } from './relevant-sort/relevant-sort';
export { default as searchBox } from './search-box/search-box';
export { default as sortBy } from './sort-by/sort-by';
export { default as stats } from './stats/stats';
export { default as toggleRefinement } from './toggle-refinement/toggle-refinement';
export { default as trendingFacets } from './trending-facets/trending-facets';
export { default as trendingItems } from './trending-items/trending-items';
export { default as voiceSearch } from './voice-search/voice-search';
export { default as frequentlyBoughtTogether } from './frequently-bought-together/frequently-bought-together';
export { default as lookingSimilar } from './looking-similar/looking-similar';
export { default as chat } from './chat/chat';
export { default as promptSuggestions } from './prompt-suggestions/prompt-suggestions';
export { default as resultCard } from './result-card/result-card';
export { default as chatTrigger } from './chat-trigger/chat-trigger';
export { default as compareBar } from './compare-bar/compare-bar';

export type * from './autocomplete/autocomplete';
export type * from './breadcrumb/breadcrumb';
export type * from './chat-trigger/chat-trigger';
export type * from './chat/chat';
export type * from './clear-refinements/clear-refinements';
export type * from './compare-bar/compare-bar';
export type * from './configure/configure';
export type * from './current-refinements/current-refinements';
export type * from './dynamic-widgets/dynamic-widgets';
export type * from './feeds/feeds';
export type * from './frequently-bought-together/frequently-bought-together';
export type * from './geo-search/geo-search';
export type * from './hierarchical-menu/hierarchical-menu';
export type * from './hits-per-page/hits-per-page';
export type * from './hits/hits';
export type * from './infinite-hits/infinite-hits';
export type * from './looking-similar/looking-similar';
export type * from './menu-select/menu-select';
export type * from './menu/menu';
export type * from './numeric-menu/numeric-menu';
export type * from './pagination/pagination';
export type * from './panel/panel';
export type * from './powered-by/powered-by';
export type * from './prompt-suggestions/prompt-suggestions';
export type * from './query-rule-context/query-rule-context';
export type {
  QueryRuleCustomDataCSSClasses,
  QueryRuleCustomDataTemplates,
  QueryRuleCustomDataWidgetParams,
  QueryRuleCustomDataWidget,
} from './query-rule-custom-data/query-rule-custom-data';
export type * from './range-input/range-input';
export type * from './range-slider/range-slider';
export type * from './rating-menu/rating-menu';
export type * from './refinement-list/refinement-list';
export type * from './related-products/related-products';
export type * from './relevant-sort/relevant-sort';
export type * from './result-card/result-card';
export type * from './search-box/search-box';
export type * from './sort-by/sort-by';
export type {
  StatsCSSClasses,
  StatsTemplates,
  StatsWidgetParams,
  StatsWidget,
} from './stats/stats';
export type * from './toggle-refinement/toggle-refinement';
export type * from './trending-facets/trending-facets';
export type * from './trending-items/trending-items';
export type * from './voice-search/voice-search';
