function MyHierarchicalMenu() {
  return (
    <HierarchicalMenu
      translations={{
        showMoreButtonText() {
          return 'Toggle';
        },
      }}
    />
  );
}

function MyPagination() {
  return (
    <Pagination
      translations={{
        pageItemText() {
          return 'Page';
        },
        pageItemAriaLabel() {
          return 'Page aria';
        },
      }}
    />
  );
}
