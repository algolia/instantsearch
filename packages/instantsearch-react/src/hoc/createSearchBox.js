import createHOC from '../createHOC';

export default createHOC({
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
