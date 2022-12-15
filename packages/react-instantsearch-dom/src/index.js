// Core
export { createConnector } from 'react-instantsearch-core';
export { HIGHLIGHT_TAGS } from 'react-instantsearch-core';
export { translatable } from 'react-instantsearch-core';

// Widget
export { Configure } from 'react-instantsearch-core';
export { ExperimentalConfigureRelatedItems } from 'react-instantsearch-core';
export { QueryRuleContext } from 'react-instantsearch-core';
export { Index } from 'react-instantsearch-core';
export { InstantSearch } from 'react-instantsearch-core';

// Connectors
export { connectAutoComplete } from 'react-instantsearch-core';
export { connectBreadcrumb } from 'react-instantsearch-core';
export { connectConfigure } from 'react-instantsearch-core';
export { EXPERIMENTAL_connectConfigureRelatedItems } from 'react-instantsearch-core';
export { connectCurrentRefinements } from 'react-instantsearch-core';
export {
  connectDynamicWidgets,
  EXPERIMENTAL_connectDynamicWidgets,
} from 'react-instantsearch-core';
export { connectGeoSearch } from 'react-instantsearch-core';
export { connectHierarchicalMenu } from 'react-instantsearch-core';
export { connectHighlight } from 'react-instantsearch-core';
export { connectHitInsights } from 'react-instantsearch-core';
export { connectHits } from 'react-instantsearch-core';
export { connectHitsPerPage } from 'react-instantsearch-core';
export { connectInfiniteHits } from 'react-instantsearch-core';
export { connectMenu } from 'react-instantsearch-core';
export { connectNumericMenu } from 'react-instantsearch-core';
export { connectPagination } from 'react-instantsearch-core';
export { connectPoweredBy } from 'react-instantsearch-core';
export { connectQueryRules } from 'react-instantsearch-core';
export { connectRange } from 'react-instantsearch-core';
export { connectRefinementList } from 'react-instantsearch-core';
export { connectScrollTo } from 'react-instantsearch-core';
export { connectSearchBox } from 'react-instantsearch-core';
export { connectRelevantSort } from 'react-instantsearch-core';
export { connectSortBy } from 'react-instantsearch-core';
export { connectStateResults } from 'react-instantsearch-core';
export { connectStats } from 'react-instantsearch-core';
export { connectToggleRefinement } from 'react-instantsearch-core';

// DOM
export { default as Breadcrumb } from './widgets/Breadcrumb';
export { default as ClearRefinements } from './widgets/ClearRefinements';
export { default as CurrentRefinements } from './widgets/CurrentRefinements';
export { default as HierarchicalMenu } from './widgets/HierarchicalMenu';
export { default as Highlight } from './widgets/Highlight';
export { default as Hits } from './widgets/Hits';
export { default as HitsPerPage } from './widgets/HitsPerPage';
export { default as InfiniteHits } from './widgets/InfiniteHits';
export { default as Menu } from './widgets/Menu';
export { default as MenuSelect } from './widgets/MenuSelect';
export { default as NumericMenu } from './widgets/NumericMenu';
export { default as Pagination } from './widgets/Pagination';
export { default as Panel } from './widgets/Panel';
export { default as PoweredBy } from './widgets/PoweredBy';
export { default as RangeInput } from './widgets/RangeInput';
export { default as RangeSlider } from './widgets/RangeSlider';
export { default as RatingMenu } from './widgets/RatingMenu';
export { default as RefinementList } from './widgets/RefinementList';
export { default as ScrollTo } from './widgets/ScrollTo';
export { default as SearchBox } from './widgets/SearchBox';
export { default as Snippet } from './widgets/Snippet';
export { default as RelevantSort } from './widgets/RelevantSort';
export { default as SortBy } from './widgets/SortBy';
export { default as Stats } from './widgets/Stats';
export { default as ToggleRefinement } from './widgets/ToggleRefinement';
export { default as VoiceSearch } from './widgets/VoiceSearch';
export { default as QueryRuleCustomData } from './widgets/QueryRuleCustomData';
export { default as EXPERIMENTAL_Answers } from './widgets/Answers';

import DynamicWidgets from './widgets/DynamicWidgets';
/** @deprecated use DynamicWidgets */
const ExperimentalDynamicWidgets = DynamicWidgets;
export { DynamicWidgets, ExperimentalDynamicWidgets };

// hooks
export { default as EXPERIMENTAL_useAnswers } from './hooks/useAnswers';

// Utils
export { createClassNames } from './core/utils';

// voiceSearchHelper
export { default as createVoiceSearchHelper } from './lib/voiceSearchHelper';

// insights
export { default as getInsightsAnonymousUserToken } from './core/getInsightsAnonymousUserToken';

// InfiniteHits Cache
export { createInfiniteHitsSessionStorageCache } from './lib/infiniteHitsCache';
