function MyHierarchicalMenu() {
  const showMore = (expanded) => (expanded ? 'Show less' : 'Show more');
  return (
    <HierarchicalMenu
      translations={{
        /* TODO: Rename this key to `showMoreButton` and change its function's first argument to an object with an `isShowingMore` key
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/ */
        showMore,
      }}
    />
  );
}

function MyPagination() {
  const page = (pageNumber) => pageNumber;
  const ariaPage = (pageNumber) => `Page ${pageNumber}`;
  return (
    <Pagination
      translations={{
        /* TODO: Rename this key and change its function's first argument to an object with a `currentPage` key
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/ */
        page,
        /* TODO: Rename this key and change its function's first argument to an object with a `currentPage` key
        See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/ */
        ariaPage,
      }}
    />
  );
}
