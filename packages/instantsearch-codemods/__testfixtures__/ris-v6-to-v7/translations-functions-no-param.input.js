function MyHierarchicalMenu() {
  return (
    <HierarchicalMenu
      translations={{
        showMore() {
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
        page() {
          return 'Page';
        },
        ariaPage() {
          return 'Page aria';
        },
      }}
    />
  );
}
