export function isSpecialClick(event) {
  const isMiddleClick = event.button === 1;
  return Boolean(
    isMiddleClick ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  );
}

export function capitalize(key) {
  return key.length === 0 ? '' : `${key[0].toUpperCase()}${key.slice(1)}`;
}

export function assertFacetDefined(searchParameters, searchResults, facet) {
  const wasRequested =
    searchParameters.isConjunctiveFacet(facet) ||
    searchParameters.isDisjunctiveFacet(facet);
  const wasReceived =
    Boolean(searchResults.getFacetByName(facet));
  if (searchResults.nbHits > 0 && wasRequested && !wasReceived) {
    // eslint-disable-next-line no-console
    console.warn(
      `A component requested values for facet "${facet}", but no facet ` +
      'values were retrieved from the API. This means that you should add ' +
      `the attribute "${facet}" to the list of attributes for faceting in ` +
      'your index settings.'
    );
  }
}
