export * from './Breadcrumb';

export const Chat = () => {
  throw new Error(
    `"<Chat>" is not available from the UMD build.

Please use React InstantSearch with a packaging system:
https://www.algolia.com/doc/guides/building-search-ui/installation/react/#install-react-instantsearch-as-an-npm-package`
  );
};
export const SearchIndexToolType = undefined;
export const createDefaultTools = () => {};

export * from './ClearRefinements';
export * from './CurrentRefinements';
export * from './FrequentlyBoughtTogether';
export * from './HierarchicalMenu';
export * from './Highlight';
export * from './Hits';
export * from './HitsPerPage';
export * from './InfiniteHits';
export * from './LookingSimilar';
export * from './Menu';
export * from './Pagination';
export * from './PoweredBy';
export * from './RangeInput';
export * from './RefinementList';
export * from './RelatedProducts';
export * from './SearchBox';
export * from './Snippet';
export * from './SortBy';
export * from './Stats';
export * from './ToggleRefinement';
export * from './TrendingItems';
