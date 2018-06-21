import { createConnector } from 'react-instantsearch-dom';

export default createConnector({
  displayName: 'AlgoliaGeoSearch',

  getProvidedProps() {
    return {};
  },

  refine(props, searchState, nextValue) {
    // eslint-disable-next-line no-unused-vars
    const { boundingBox, ...sliceSearchState } = searchState;

    return {
      ...sliceSearchState,
      aroundLatLng: nextValue,
    };
  },

  getSearchParameters(searchParameters, props, searchState) {
    const currentRefinement =
      searchState.aroundLatLng || props.defaultRefinement;

    return searchParameters
      .setQueryParameter('insideBoundingBox')
      .setQueryParameter(
        'aroundLatLng',
        `${currentRefinement.lat}, ${currentRefinement.lng}`
      );
  },
});
