import createConnector from '../createConnector';

export default createConnector({
  displayName: 'AlgoliaLoading',

  getProps(props, state, search) {
    return {
      loading: search.loading,
    };
  },
});
