import { warn } from './lib/warn';

warn(
  Date.now() < new Date('2023-08-09').getTime(),
  'The package `react-instantsearch-hooks` is replaced by `react-instantsearch-core`. The API is the same, but the package name has changed. Please update your dependencies and follow the migration guide: https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/'
);

export { default as version } from './version';
export * from './components/Configure';
export * from './components/DynamicWidgets';
export * from './components/Index';
export * from './components/InstantSearch';
export * from './components/InstantSearchServerContext';
export * from './components/InstantSearchSSRProvider';
export * from './connectors/useBreadcrumb';
export * from './connectors/useClearRefinements';
export * from './connectors/useConfigure';
export * from './connectors/useCurrentRefinements';
export * from './connectors/useDynamicWidgets';
export * from './connectors/useGeoSearch';
export * from './connectors/useHierarchicalMenu';
export * from './connectors/useHits';
export * from './connectors/useHitsPerPage';
export * from './connectors/useInfiniteHits';
export * from './connectors/useMenu';
export * from './connectors/useNumericMenu';
export * from './connectors/usePagination';
export * from './connectors/usePoweredBy';
export * from './connectors/useQueryRules';
export * from './connectors/useRange';
export * from './connectors/useRefinementList';
export * from './connectors/useSearchBox';
export * from './connectors/useSortBy';
export * from './connectors/useStats';
export * from './connectors/useToggleRefinement';
export * from './hooks/useConnector';
export * from './hooks/useInstantSearch';
export * from './server';
