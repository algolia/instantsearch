import createConnector from '../createConnector';

export default createConnector({
  displayName: 'AlgoliaCurrentFilters',

  getProps(props, state, search, metadata) {
    return {
      filters: metadata.reduce((res, meta) =>
        typeof meta.filters !== 'undefined' ? res.concat(meta.filters) : res
      , []),
    };
  },

  refine(props, state, filters) {
    return filters.reduce((res, filter) => filter.clear(res), state);
  },
});
