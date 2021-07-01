import PropTypes from 'prop-types';
import createConnector from '../core/createConnector';
import { getResults } from '../core/indexUtils';

export default createConnector({
  displayName: 'AlgoliaDynamicWidgets',

  defaultProps: {
    transformItems: items => items,
  },

  propTypes: {
    transformItems: PropTypes.func,
  },

  getProvidedProps(props, _searchState, searchResults) {
    const results = getResults(searchResults, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });

    if (!results) {
      return { attributesToRender: [] };
    }

    const facetOrder =
      (results.renderingContent &&
        results.renderingContent.facetOrdering &&
        results.renderingContent.facetOrdering.facet &&
        results.renderingContent.facetOrdering.facet.order) ||
      [];

    return {
      attributesToRender: props.transformItems(facetOrder, { results }),
    };
  },
});
