import createConnector from '../core/createConnector';

/**
 * connectCurrentRefinements connector provides the logic to build a widget that will
 * give the user the ability to remove all or some of the filters that were
 * set.
 * @name connectCurrentRefinements
 * @kind connector
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {array.<{label: string, attributeName: string, currentRefinement: string || object, items: array, value: function}>} items - all the filters, the `value` is to pass to the `refine` function for removing all currentrefinements, `label` is for the display. When existing several refinements for the same atribute name, then you get a nested `items` object that contains a `label` and a `value` function to use to remove a single filter. `attributeName` and `currentRefinement` are metadata containing row values.
 */
export default createConnector({
  displayName: 'AlgoliaCurrentRefinements',

  getProvidedProps(props, state, search, metadata) {
    return {
      items: metadata.reduce((res, meta) =>
          typeof meta.items !== 'undefined' ? res.concat(meta.items) : res
        , []),
    };
  },

  refine(props, state, items) {
    // `value` corresponds to our internal clear function computed in each connector metadata.
    const refinementsToClear = items instanceof Array ? items.map(item => item.value) : [items];
    return refinementsToClear.reduce((res, clear) => clear(res), state);
  },
});
