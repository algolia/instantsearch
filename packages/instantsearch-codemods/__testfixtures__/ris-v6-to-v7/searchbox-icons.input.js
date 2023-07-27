function Search() {
  const reset = <div>Reset</div>;

  const renderLoadingIndicator = () => <div>Loading</div>;

  return (
    <SearchBox
      submit={<div>Submit</div>}
      reset={reset}
      loadingIndicator={renderLoadingIndicator()}
    />
  );
}
