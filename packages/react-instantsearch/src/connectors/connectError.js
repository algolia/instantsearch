import createConnector from '../core/createConnector';

export default createConnector({
  displayName: 'AlgoliaError',

  getProps(props, state, search) {
    if (!search.error) {
      return null;
    }
    return {
      error: search.error,
    };
  },
});
