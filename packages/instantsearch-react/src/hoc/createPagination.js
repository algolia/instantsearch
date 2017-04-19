import createHOC from '../createHOC';

export default createHOC({
  displayName: 'AlgoliaPagination',

  mapStateToProps(state) {
    return {
      nbPages: state.searchResults && state.searchResults.nbPages,
      page: state.searchParameters.page,
    };
  },

  refine(state, props, pageNumber) {
    return state.setPage(pageNumber);
  },
});
