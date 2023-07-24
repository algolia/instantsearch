import PropTypes from 'prop-types';

import createConnector from '../core/createConnector';
// @ts-ignore
import { getResults } from '../core/indexUtils';

import type { SearchParameters } from 'algoliasearch-helper';

const MAX_WILDCARD_FACETS = 20;

export default createConnector({
  displayName: 'AlgoliaDynamicWidgets',
  $$type: 'ais.dynamicWidgets',

  defaultProps: {
    transformItems: (items: any[]) => items,
    maxValuesPerFacet: 20,
  },

  propTypes: {
    transformItems: PropTypes.func,
    facets: PropTypes.arrayOf(PropTypes.string),
    maxValuesPerFacet: PropTypes.number,
  },

  getProvidedProps(props, _searchState, searchResults) {
    const results = getResults(searchResults, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });

    if (
      props.facets &&
      !(
        Array.isArray(props.facets) &&
        props.facets.length <= 1 &&
        (props.facets[0] === '*' || props.facets[0] === undefined)
      )
    ) {
      throw new Error(
        `The \`facets\` prop only accepts [] or ["*"], you passed ${JSON.stringify(
          props.facets
        )}`
      );
    }

    if (!results) {
      return { attributesToRender: [] };
    }

    const facetOrder =
      (results.renderingContent &&
        results.renderingContent.facetOrdering &&
        results.renderingContent.facetOrdering.facets &&
        results.renderingContent.facetOrdering.facets.order) ||
      [];

    const attributesToRender = props.transformItems(facetOrder, { results });

    if (attributesToRender.length > MAX_WILDCARD_FACETS && !props.facets) {
      // eslint-disable-next-line no-console
      console.warn(
        `More than ${MAX_WILDCARD_FACETS} facets are requested to be displayed without explicitly setting which facets to retrieve. This could have a performance impact. Set "facets" to [] to do two smaller network requests, or explicitly to ['*'] to avoid this warning.`
      );
    }

    if (props.maxValuesPerFacet < results._state.maxValuesPerFacet) {
      // eslint-disable-next-line no-console
      console.warn(
        `The maxValuesPerFacet set by dynamic widgets (${props.maxValuesPerFacet}) is smaller than one of the limits set by a widget (${results._state.maxValuesPerFacet}). This causes a mismatch in query parameters and thus an extra network request when that widget is mounted.`
      );
    }

    return {
      attributesToRender,
    };
  },

  getSearchParameters(searchParameters, props) {
    return (props.facets || ['*']).reduce(
      (acc: SearchParameters, curr: string) => acc.addFacet(curr),
      searchParameters.setQueryParameters({
        maxValuesPerFacet: Math.max(
          props.maxValuesPerFacet || 0,
          searchParameters.maxValuesPerFacet || 0
        ),
      })
    );
  },
});
