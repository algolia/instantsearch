function MyHierarchicalMenu() {
  return (
    <HierarchicalMenu
      translations={{
        showMore: (expanded) => (expanded ? 'Show less' : 'Show more'),
      }}
    />
  );
}

function MyPagination() {
  return (
    <Pagination
      translations={{
        page: (page) => page,
        ariaPage: (page) => `Page ${page}`,
      }}
    />
  );
}
