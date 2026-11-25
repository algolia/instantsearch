/**
 * Maps the `classNames` of a Vue widget using the SearchBox classes (the
 * search box and the searchable RefinementList) onto the shared component's.
 */
export function getSearchBoxClassNames(classNames) {
  return (
    classNames && {
      root: classNames['ais-SearchBox'],
      form: classNames['ais-SearchBox-form'],
      input: classNames['ais-SearchBox-input'],
      submit: classNames['ais-SearchBox-submit'],
      submitIcon: classNames['ais-SearchBox-submitIcon'],
      reset: classNames['ais-SearchBox-reset'],
      resetIcon: classNames['ais-SearchBox-resetIcon'],
      loadingIndicator: classNames['ais-SearchBox-loadingIndicator'],
      loadingIcon: classNames['ais-SearchBox-loadingIcon'],
    }
  );
}
