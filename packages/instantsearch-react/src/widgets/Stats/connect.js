import createConnector from '../../core/createConnector';

export default createConnector({
  displayName: 'AlgoliaStats',

  getProps(props, state, search) {
    if (!search.results) {
      return null;
    }
    return {
      nbHits: search.results.nbHits,
      processingTimeMS: search.results.processingTimeMS,
    };
  },
});
