// Core
export { default as createConnector } from './core/createConnector';
export {
  instantSearchContext,
  InstantSearchConsumer,
  InstantSearchProvider,
} from './core/context';

// Utils
// @ts-ignore not yet typed
export { HIGHLIGHT_TAGS } from './core/highlight';
// @ts-ignore not yet typed
export { default as version } from './core/version';
// @ts-ignore not yet typed
export { default as translatable } from './core/translatable';

// Widgets
// @ts-ignore not yet typed
export { default as Configure } from './widgets/Configure';
export { default as ExperimentalConfigureRelatedItems } from './widgets/ConfigureRelatedItems';

import { default as connectDynamicWidgets } from './connectors/connectDynamicWidgets';
import { default as DynamicWidgets } from './widgets/DynamicWidgets';
/** @deprecated use DynamicWidgets */
const ExperimentalDynamicWidgets = DynamicWidgets;
export { ExperimentalDynamicWidgets, DynamicWidgets };

export { default as QueryRuleContext } from './widgets/QueryRuleContext';
export { default as Index } from './widgets/Index';
export { default as InstantSearch } from './widgets/InstantSearch';

// Connectors
// @ts-ignore not yet typed
export { default as connectAutoComplete } from './connectors/connectAutoComplete';
// @ts-ignore not yet typed
export { default as connectBreadcrumb } from './connectors/connectBreadcrumb';
// @ts-ignore not yet typed
export { default as connectConfigure } from './connectors/connectConfigure';
export { default as EXPERIMENTAL_connectConfigureRelatedItems } from './connectors/connectConfigureRelatedItems';
// @ts-ignore not yet typed
export { default as connectCurrentRefinements } from './connectors/connectCurrentRefinements';

/** @deprecated use connectDynamicWidgets */
const EXPERIMENTAL_connectDynamicWidgets = connectDynamicWidgets;
export { connectDynamicWidgets, EXPERIMENTAL_connectDynamicWidgets };

// @ts-ignore not yet typed
export { default as connectGeoSearch } from './connectors/connectGeoSearch';
// @ts-ignore not yet typed
export { default as connectHierarchicalMenu } from './connectors/connectHierarchicalMenu';
// @ts-ignore not yet typed
export { default as connectHighlight } from './connectors/connectHighlight';
// @ts-ignore not yet typed
export { default as connectHits } from './connectors/connectHits';
// @ts-ignore not yet typed
export { default as connectHitsPerPage } from './connectors/connectHitsPerPage';
// @ts-ignore not yet typed
export { default as connectInfiniteHits } from './connectors/connectInfiniteHits';
// @ts-ignore not yet typed
export { default as connectMenu } from './connectors/connectMenu';
// @ts-ignore not yet typed
export { default as connectNumericMenu } from './connectors/connectNumericMenu';
// @ts-ignore not yet typed
export { default as connectPagination } from './connectors/connectPagination';
// @ts-ignore not yet typed
export { default as connectPoweredBy } from './connectors/connectPoweredBy';
// @ts-ignore not yet typed
export { default as connectQueryRules } from './connectors/connectQueryRules';
// @ts-ignore not yet typed
export { default as connectRange } from './connectors/connectRange';
// @ts-ignore not yet typed
export { default as connectRefinementList } from './connectors/connectRefinementList';
// @ts-ignore not yet typed
export { default as connectScrollTo } from './connectors/connectScrollTo';
// @ts-ignore not yet typed
export { default as connectSearchBox } from './connectors/connectSearchBox';
// @ts-ignore not yet typed
export { default as connectRelevantSort } from './connectors/connectRelevantSort';
// @ts-ignore not yet typed
export { default as connectSortBy } from './connectors/connectSortBy';
// @ts-ignore not yet typed
export { default as connectStateResults } from './connectors/connectStateResults';
// @ts-ignore not yet typed
export { default as connectStats } from './connectors/connectStats';
// @ts-ignore not yet typed
export { default as connectToggleRefinement } from './connectors/connectToggleRefinement';
// @ts-ignore not yet typed
export { default as connectHitInsights } from './connectors/connectHitInsights';
// @ts-ignore not yet typed
export { default as connectVoiceSearch } from './connectors/connectVoiceSearch';

// Types
export * from './types';
