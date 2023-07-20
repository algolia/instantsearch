function MyHierarchicalMenu() {
  return (
    <HierarchicalMenu
      translations={{
        showMoreButtonText: function ({ isShowingMore: isExpanded }) {
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
        pageItemText: function ({ currentPage: pageNumber }) {
          return pageNumber;
        },
        pageItemAriaLabel: function ({ currentPage: pageNumber }) {
          return `Page ${pageNumber}`;
        },
      }}
    />
  );
}
