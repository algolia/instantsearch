import createConnector from '../createConnector';

export default createConnector({
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
