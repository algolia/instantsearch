import PropTypes from 'prop-types';

import createConnector from '../core/createConnector';

/**
 * connectCurrentRefinements connector provides the logic to build a widget that will
 * give the user the ability to remove all or some of the filters that were
 * set.
 * @name connectCurrentRefinements
 * @kind connector
 * @propType {function} [transformItems] - Function to modify the items being displayed, e.g. for filtering or sorting them. Takes an items as parameter and expects it back in return.
 * @propType {function} [clearsQuery=false] - Pass true to also clear the search query
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {array.<{label: string, attribute: string, currentRefinement: string || object, items: array, value: function}>} items - all the filters, the `value` is to pass to the `refine` function for removing all currentrefinements, `label` is for the display. When existing several refinements for the same atribute name, then you get a nested `items` object that contains a `label` and a `value` function to use to remove a single filter. `attribute` and `currentRefinement` are metadata containing row values.
 * @providedPropType {string} query - the search query
 */
export default createConnector({
  displayName: 'AlgoliaCurrentRefinements',
  $$type: 'ais.currentRefinements',

  propTypes: {
    transformItems: PropTypes.func,
  },

  getProvidedProps(props, searchState, searchResults, metadata) {
    const items = metadata.reduce((res, meta) => {
      if (typeof meta.items !== 'undefined') {
        if (!props.clearsQuery && meta.id === 'query') {
          return res;
        } else {
          if (
            props.clearsQuery &&
            meta.id === 'query' &&
            meta.items[0].currentRefinement === ''
          ) {
            return res;
          }
          return res.concat(
            meta.items.map((item) => ({
              ...item,
              id: meta.id,
              index: meta.index,
            }))
          );
        }
      }
      return res;
    }, []);

    const transformedItems = props.transformItems
      ? props.transformItems(items)
      : items;

    return {
      items: transformedItems,
      canRefine: transformedItems.length > 0,
    };
  },

  refine(props, searchState, items) {
    // `value` corresponds to our internal clear function computed in each connector metadata.
    const refinementsToClear =
      items instanceof Array ? items.map((item) => item.value) : [items];
    return refinementsToClear.reduce((res, clear) => clear(res), searchState);
  },
});
