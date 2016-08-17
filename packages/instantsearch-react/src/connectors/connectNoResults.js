import createConnector from '../createConnector';

export default createConnector({
  displayName: 'AlgoliaNoResults',

  getProps(props, state, search) {
    if (!search.results) {
      return null;
    }
    return {
      noResults: search.results.nbHits === 0,
    };
  },
});
