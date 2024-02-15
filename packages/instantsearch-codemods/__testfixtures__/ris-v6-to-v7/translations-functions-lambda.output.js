function MyHierarchicalMenu() {
  return (
    <HierarchicalMenu
      translations={{
        showMoreButtonText: ({
          isShowingMore: expanded
        }) => (expanded ? 'Show less' : 'Show more'),
      }}
    />
  );
}

function MyPagination() {
  return (
    <Pagination
      translations={{
        pageItemText: ({
          currentPage: page
        }) => page,
        pageItemAriaLabel: ({
          currentPage: page
        }) => `Page ${page}`,
      }}
    />
  );
}
