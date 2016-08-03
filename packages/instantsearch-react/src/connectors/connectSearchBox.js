import createConnector from '../createConnector';

export default createConnector({
  displayName: 'AlgoliaSearchBox',

  mapStateToProps(state) {
    return {
      query: state.searchParameters.query,
    };
  },

  refine(state, props, query) {
    return state.setQuery(query);
  },
});
