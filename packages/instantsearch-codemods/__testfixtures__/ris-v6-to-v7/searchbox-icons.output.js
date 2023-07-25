function Search() {
  const reset = <div>Reset</div>;

  const renderLoadingIndicator = () => <div>Loading</div>;

  return (
    <SearchBox
      submitIconComponent={() => <div>Submit</div>}
      resetIconComponent={() => reset}
      loadingIconComponent={() => renderLoadingIndicator()}
    />
  );
}
