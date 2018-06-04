// Core
export { default as createInstantSearch } from './core/createInstantSearch';
export { default as createIndex } from './core/createIndex';
export { default as createConnector } from './core/createConnector';

// Utlis
export { HIGHLIGHT_TAGS } from './core/highlight';
export { default as version } from './core/version';

// Widgets
export { default as Configure } from './widgets/Configure';

// Connectors
export {
  default as connectAutoComplete,
} from './connectors/connectAutoComplete';
export { default as connectBreadcrumb } from './connectors/connectBreadcrumb';
export { default as connectConfigure } from './connectors/connectConfigure';
export {
  default as connectCurrentRefinements,
} from './connectors/connectCurrentRefinements';
export {
  default as connectHierarchicalMenu,
} from './connectors/connectHierarchicalMenu';
export { default as connectHighlight } from './connectors/connectHighlight';
export { default as connectHits } from './connectors/connectHits';
export { default as connectHitsPerPage } from './connectors/connectHitsPerPage';
export {
  default as connectInfiniteHits,
} from './connectors/connectInfiniteHits';
export { default as connectMenu } from './connectors/connectMenu';
export { default as connectNumericMenu } from './connectors/connectNumericMenu';
export { default as connectPagination } from './connectors/connectPagination';
export { default as connectPoweredBy } from './connectors/connectPoweredBy';
export { default as connectRange } from './connectors/connectRange';
export {
  default as connectRefinementList,
} from './connectors/connectRefinementList';
export { default as connectScrollTo } from './connectors/connectScrollTo';
export { default as connectSearchBox } from './connectors/connectSearchBox';
export { default as connectSortBy } from './connectors/connectSortBy';
export {
  default as connectStateResults,
} from './connectors/connectStateResults';
export { default as connectStats } from './connectors/connectStats';
export {
  default as connectToggleRefinement,
} from './connectors/connectToggleRefinement';
