function MyHierarchicalMenu() {
  const showMore = (expanded) => (expanded ? 'Show less' : 'Show more');
  return (
    <HierarchicalMenu
      translations={{
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
        page,
        ariaPage,
      }}
    />
  );
}
