function MyHierarchicalMenu() {
  return (
    <HierarchicalMenu
      translations={{
        showMore: function (isExpanded) {
          return isExpanded ? 'Show less' : 'Show more';
        },
      }}
    />
  );
}

function MyPagination() {
  return (
    <Pagination
      translations={{
        page: function (pageNumber) {
          return pageNumber;
        },
        ariaPage: function (pageNumber) {
          return `Page ${pageNumber}`;
        },
      }}
    />
  );
}
