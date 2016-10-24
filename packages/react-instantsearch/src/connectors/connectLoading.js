import createConnector from '../core/createConnector';

export default createConnector({
  displayName: 'AlgoliaLoading',

  getProps(props, state, search) {
    return {
      loading: search.loading,
    };
  },
});
