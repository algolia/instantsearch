function MySearchbox() {
  const placeholder = 'Search here';
  return (
    <SearchBox
      translations={{
        // TODO: Move this as a `placeholder` prop for `SearchBox`
        placeholder,
      }}
    />
  );
}

function MyRefinementList() {
  const placeholder = 'Search here';
  return (
    <RefinementList
      translations={{
        // TODO: Move this as a `searchablePlaceholder` prop for `RefinementList`
        placeholder,
      }}
    />
  );
}
