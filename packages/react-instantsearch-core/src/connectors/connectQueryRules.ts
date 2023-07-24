import createConnector from '../core/createConnector';
// @ts-ignore
import { getResults, getIndexId, hasMultipleIndices } from '../core/indexUtils';

import type { ConnectedProps } from '../core/createConnector';

type SearchState = any;

type SearchParameters = any;

export type CustomUserData = {
  [key: string]: any;
};

type TrackedFilterRefinement = string | number | boolean;

export type QueryRulesProps<TItem = CustomUserData> = {
  trackedFilters: {
    [facetName: string]: (
      facetValues: TrackedFilterRefinement[]
    ) => TrackedFilterRefinement[];
  };
  transformRuleContexts: (ruleContexts: string[]) => string[];
  transformItems: (items: TItem[]) => TItem[];
};

// A context rule must consist only of alphanumeric characters, hyphens, and underscores.
// See https://www.algolia.com/doc/guides/managing-results/refine-results/merchandising-and-promoting/in-depth/implementing-query-rules/#context
function escapeRuleContext(ruleName: string): string {
  return ruleName.replace(/[^a-z0-9-_]+/gi, '_');
}

function getWidgetRefinements(
  attribute: string,
  widgetKey: string,
  searchState: SearchState
): TrackedFilterRefinement[] {
  const widgetState = searchState[widgetKey];

  switch (widgetKey) {
    case 'range':
      return Object.keys(widgetState[attribute]).map(
        (rangeKey) => widgetState[attribute][rangeKey]
      );

    case 'refinementList':
      return widgetState[attribute];

    case 'hierarchicalMenu':
      return [widgetState[attribute]];

    case 'menu':
      return [widgetState[attribute]];

    case 'multiRange':
      return widgetState[attribute].split(':');

    case 'toggle':
      return [widgetState[attribute]];

    default:
      return [];
  }
}

function getRefinements(
  attribute: string,
  searchState: SearchState = {}
): TrackedFilterRefinement[] {
  const refinements = Object.keys(searchState)
    .filter(
      (widgetKey) =>
        searchState[widgetKey] !== undefined &&
        searchState[widgetKey][attribute] !== undefined
    )
    .map((widgetKey) => getWidgetRefinements(attribute, widgetKey, searchState))
    .reduce((acc, current) => acc.concat(current), []); // flatten the refinements

  return refinements;
}

function getRuleContextsFromTrackedFilters({
  searchState,
  trackedFilters,
}: {
  searchState: SearchState;
  trackedFilters: QueryRulesProps['trackedFilters'];
}) {
  const ruleContexts = Object.keys(trackedFilters).reduce<string[]>(
    (facets, facetName) => {
      const facetRefinements: TrackedFilterRefinement[] = getRefinements(
        facetName,
        searchState
      );

      const getTrackedFacetValues = trackedFilters[facetName];
      const trackedFacetValues = getTrackedFacetValues(facetRefinements);

      return [
        ...facets,
        ...facetRefinements
          .filter((facetRefinement) =>
            trackedFacetValues.includes(facetRefinement)
          )
          .map((facetValue) =>
            escapeRuleContext(`ais-${facetName}-${facetValue}`)
          ),
      ];
    },
    []
  );

  return ruleContexts;
}

const defaultProps: QueryRulesProps = {
  transformItems: (items) => items,
  transformRuleContexts: (ruleContexts) => ruleContexts,
  trackedFilters: {},
};

export default createConnector({
  displayName: 'AlgoliaQueryRules',
  $$type: 'ais.queryRules',

  defaultProps,

  getProvidedProps(
    props: ConnectedProps<QueryRulesProps>,
    _1: any,
    searchResults: any
  ) {
    const results = getResults(searchResults, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });

    if (results === null) {
      return {
        items: [],
        canRefine: false,
      };
    }

    const { userData = [] } = results;
    const { transformItems } = props;
    const transformedItems = transformItems(userData);

    return {
      items: transformedItems,
      canRefine: transformedItems.length > 0,
    };
  },

  getSearchParameters(
    searchParameters: SearchParameters,
    props: ConnectedProps<QueryRulesProps>,
    searchState: SearchState
  ) {
    if (Object.keys(props.trackedFilters).length === 0) {
      return searchParameters;
    }

    const indexSearchState =
      hasMultipleIndices({
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      }) && searchState.indices
        ? searchState.indices[
            getIndexId({
              ais: props.contextValue,
              multiIndexContext: props.indexContextValue,
            })
          ]
        : searchState;

    const newRuleContexts = getRuleContextsFromTrackedFilters({
      searchState: indexSearchState,
      trackedFilters: props.trackedFilters,
    });

    const initialRuleContexts = searchParameters.ruleContexts || [];
    const nextRuleContexts = [...initialRuleContexts, ...newRuleContexts];

    if (process.env.NODE_ENV === 'development') {
      if (nextRuleContexts.length > 10) {
        // eslint-disable-next-line no-console
        console.warn(
          `The maximum number of \`ruleContexts\` is 10. They have been sliced to that limit.
Consider using \`transformRuleContexts\` to minimize the number of rules sent to Algolia.`
        );
      }
    }

    const ruleContexts = props
      .transformRuleContexts(nextRuleContexts)
      .slice(0, 10);

    return searchParameters.setQueryParameter('ruleContexts', ruleContexts);
  },
});
