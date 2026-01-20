import {
  checkRendering,
  createDocumentationMessageGenerator,
  getAlgoliaAgent,
  getAppIdAndApiKey,
  noop,
} from '../../lib/utils';

import type {
  Connector,
  InitOptions,
  RenderOptions,
  TransformItems,
  WidgetRenderState,
} from '../../types';
import type { SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'filter-suggestions',
  connector: true,
});

export type Suggestion = {
  /**
   * The facet attribute name.
   */
  attribute: string;
  /**
   * The facet value to filter by.
   */
  value: string;
  /**
   * Human-readable display label.
   */
  label: string;
  /**
   * Number of records matching this filter.
   */
  count: number;
};

export type FilterSuggestionsRenderState = {
  /**
   * The list of suggested refinements.
   */
  suggestions: Suggestion[];
  /**
   * Whether suggestions are currently being fetched.
   */
  isLoading: boolean;
  /**
   * Applies a refinement for the given attribute and value.
   */
  refine: (attribute: string, value: string) => void;
};

export type FilterSuggestionsConnectorParams = {
  /**
   * The ID of the agent configured in the Algolia dashboard.
   */
  agentId: string;
  /**
   * Limit to specific facet attributes.
   */
  attributes?: string[];
  /**
   * Maximum number of suggestions to return.
   * @default 3
   */
  maxSuggestions?: number;
  /**
   * Debounce delay in milliseconds before fetching suggestions.
   * @default 300
   */
  debounceMs?: number;
  /**
   * Number of hits to send for context.
   * @default 5
   */
  hitsToSample?: number;
  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<Suggestion>;
};

export type FilterSuggestionsWidgetDescription = {
  $$type: 'ais.filterSuggestions';
  renderState: FilterSuggestionsRenderState;
  indexRenderState: {
    filterSuggestions: WidgetRenderState<
      FilterSuggestionsRenderState,
      FilterSuggestionsConnectorParams
    >;
  };
};

export type FilterSuggestionsConnector = Connector<
  FilterSuggestionsWidgetDescription,
  FilterSuggestionsConnectorParams
>;

const connectFilterSuggestions: FilterSuggestionsConnector =
  function connectFilterSuggestions(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      const {
        agentId,
        attributes,
        maxSuggestions = 3,
        debounceMs = 300,
        hitsToSample = 5,
        transformItems = ((items) => items) as NonNullable<
          FilterSuggestionsConnectorParams['transformItems']
        >,
      } = widgetParams;

      if (!agentId) {
        throw new Error(withUsage('The `agentId` option is required.'));
      }

      let endpoint: string;
      let headers: Record<string, string>;
      let suggestions: Suggestion[] = [];
      let isLoading = false;
      let debounceTimer: ReturnType<typeof setTimeout> | undefined;
      let lastStateSignature: string | null = null; // null means never fetched
      let refine: FilterSuggestionsRenderState['refine'];
      let searchHelper: InitOptions['helper'] | null = null;
      let latestRenderOptions: RenderOptions | null = null;

      // Create a signature of the current search state (query + refinements)
      const getStateSignature = (results: SearchResults): string => {
        const query = results.query || '';
        const refinements = searchHelper
          ? JSON.stringify(searchHelper.state.facetsRefinements) +
            JSON.stringify(searchHelper.state.disjunctiveFacetsRefinements) +
            JSON.stringify(searchHelper.state.hierarchicalFacetsRefinements)
          : '';
        return `${query}|${refinements}`;
      };

      const getWidgetRenderState = (
        renderOptions: InitOptions | RenderOptions
      ) => {
        const results =
          'results' in renderOptions ? renderOptions.results : undefined;
        const transformedSuggestions = transformItems(suggestions, { results });

        return {
          suggestions: transformedSuggestions,
          isLoading,
          refine,
          widgetParams,
        };
      };

      const fetchSuggestions = (
        results: SearchResults,
        renderOptions: RenderOptions
      ) => {
        if (!results?.hits?.length) {
          suggestions = [];
          isLoading = false;
          renderFn(
            {
              ...getWidgetRenderState(renderOptions),
              instantSearchInstance: renderOptions.instantSearchInstance,
            },
            false
          );
          return;
        }

        isLoading = true;
        renderFn(
          {
            ...getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );

        // Get facets from raw results (results.facets is processed differently)
        const rawResults = results._rawResults as Array<{
          facets?: Record<string, Record<string, number>>;
        }>;
        const rawFacets = rawResults?.[0]?.facets || {};

        const facetsToSend = attributes
          ? Object.fromEntries(
              Object.entries(rawFacets).filter(([key]) =>
                attributes.includes(key)
              )
            )
          : rawFacets;

        // Collect current refinements to exclude from suggestions
        const currentRefinements: Array<{ attribute: string; value: string }> =
          [];
        if (searchHelper) {
          // Regular facets
          Object.entries(searchHelper.state.facetsRefinements || {}).forEach(
            ([attr, values]) => {
              values.forEach((val) =>
                currentRefinements.push({ attribute: attr, value: val })
              );
            }
          );
          // Disjunctive facets
          Object.entries(
            searchHelper.state.disjunctiveFacetsRefinements || {}
          ).forEach(([attr, values]) => {
            values.forEach((val) =>
              currentRefinements.push({ attribute: attr, value: val })
            );
          });
          // Hierarchical facets
          Object.entries(
            searchHelper.state.hierarchicalFacetsRefinements || {}
          ).forEach(([attr, values]) => {
            values.forEach((val) =>
              currentRefinements.push({ attribute: attr, value: val })
            );
          });
        }

        const messageText = JSON.stringify({
          query: results.query,
          facets: facetsToSend,
          hitsSample: results.hits.slice(0, hitsToSample),
          currentRefinements,
          maxSuggestions,
        });

        const payload = {
          messages: [
            {
              id: `sr-${Date.now()}`,
              createdAt: new Date().toISOString(),
              role: 'user',
              parts: [
                {
                  type: 'text',
                  text: messageText,
                },
              ],
            },
          ],
        };

        fetch(endpoint, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            const parsedSuggestions = JSON.parse(data.parts[1].text);

            const validSuggestions = (
              Array.isArray(parsedSuggestions) ? parsedSuggestions : []
            )
              .filter((suggestion) => {
                if (
                  !suggestion?.attribute ||
                  !suggestion?.value ||
                  !suggestion?.label
                ) {
                  return false;
                }
                // If attributes filter is specified, only allow suggestions for those attributes
                if (attributes && !attributes.includes(suggestion.attribute)) {
                  return false;
                }
                return true;
              })
              .slice(0, maxSuggestions);

            suggestions = validSuggestions;
          })
          .catch(() => {
            suggestions = [];
          })
          .finally(() => {
            isLoading = false;
            renderFn(
              {
                ...getWidgetRenderState(renderOptions),
                instantSearchInstance: renderOptions.instantSearchInstance,
              },
              false
            );
          });
      };

      return {
        $$type: 'ais.filterSuggestions',

        init(initOptions) {
          const { instantSearchInstance, helper } = initOptions;
          searchHelper = helper;

          const [appId, apiKey] = getAppIdAndApiKey(
            instantSearchInstance.client
          );

          if (!appId || !apiKey) {
            throw new Error(
              withUsage(
                'Could not extract Algolia credentials from the search client.'
              )
            );
          }

          endpoint = `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5&stream=false`;
          headers = {
            'x-algolia-application-id': appId,
            'x-algolia-api-key': apiKey,
            'x-algolia-agent': getAlgoliaAgent(instantSearchInstance.client),
          };

          refine = (attribute: string, value: string) => {
            // Check if the attribute belongs to a hierarchical facet
            // by finding a hierarchical facet that includes this attribute
            const hierarchicalFacet = helper.state.hierarchicalFacets.find(
              (facet) => facet.attributes.includes(attribute)
            );

            if (hierarchicalFacet) {
              // Use the hierarchical facet name for toggling
              helper.toggleFacetRefinement(hierarchicalFacet.name, value);
            } else {
              helper.toggleFacetRefinement(attribute, value);
            }
            helper.search();
          };

          renderFn(
            {
              ...getWidgetRenderState(initOptions),
              instantSearchInstance,
            },
            true
          );
        },

        render(renderOptions) {
          const { results, instantSearchInstance } = renderOptions;

          // Always store the latest render options
          latestRenderOptions = renderOptions;

          if (!results) {
            renderFn(
              {
                ...getWidgetRenderState(renderOptions),
                instantSearchInstance,
              },
              false
            );
            return;
          }

          // Debounce: only fetch if search state changed (query or refinements) and after delay
          const stateSignature = getStateSignature(results);
          if (stateSignature !== lastStateSignature) {
            lastStateSignature = stateSignature;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              // Use the latest render options when the timeout fires
              if (latestRenderOptions?.results) {
                fetchSuggestions(
                  latestRenderOptions.results,
                  latestRenderOptions
                );
              }
            }, debounceMs);
          }

          renderFn(
            {
              ...getWidgetRenderState(renderOptions),
              instantSearchInstance,
            },
            false
          );
        },

        dispose() {
          clearTimeout(debounceTimer);
          unmountFn();
        },

        getRenderState(renderState, renderOptions) {
          return {
            ...renderState,
            filterSuggestions: this.getWidgetRenderState(renderOptions),
          };
        },

        getWidgetRenderState(renderOptions) {
          return getWidgetRenderState(renderOptions);
        },
      };
    };
  };

export default connectFilterSuggestions;
