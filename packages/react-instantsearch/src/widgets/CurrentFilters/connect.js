import createConnector from '../../core/createConnector';

/**
 * CurrentFilters connector provides the logic to build a widget that will
 * give the user the ability to remove all or some of the filters that were
 * set.
 * @name CurrentFilters
 * @kind HOC
 * @category connector
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {array.<{key: strging, label: string}>} filters - all the filters, the key for calling the refine prop function, label is for the display.
 */
export default createConnector({
  displayName: 'AlgoliaCurrentFilters',

  getProps(props, state, search, metadata) {
    return {
      items: metadata.reduce((res, meta) =>
        typeof meta.filters !== 'undefined' ? res.concat(meta.filters) : res
      , []),
    };
  },

  refine(props, state, filters) {
    return filters.reduce((res, filter) => filter.clear(res), state);
  },
});
