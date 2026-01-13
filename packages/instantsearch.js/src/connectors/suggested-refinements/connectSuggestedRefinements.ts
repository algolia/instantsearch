import {
  checkRendering,
  createDocumentationMessageGenerator,
  getAlgoliaAgent,
  getAppIdAndApiKey,
  isFacetRefined,
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
  name: 'refinement-suggestions',
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
  /**
   * Whether this refinement is currently applied.
   */
  isRefined: boolean;
};

export type RefinementSuggestionsRenderState = {
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

export type RefinementSuggestionsConnectorParams = {
  /**
   * The ID of the agent configured in the Algolia dashboard.
   */
  agentId: string;
  /**
   * The facet attributes to generate suggestions for.
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

export type RefinementSuggestionsWidgetDescription = {
  $$type: 'ais.refinementSuggestions';
  renderState: RefinementSuggestionsRenderState;
  indexRenderState: {
    refinementSuggestions: WidgetRenderState<
      RefinementSuggestionsRenderState,
      RefinementSuggestionsConnectorParams
    >;
  };
};

export type RefinementSuggestionsConnector = Connector<
  RefinementSuggestionsWidgetDescription,
  RefinementSuggestionsConnectorParams
>;

const connectRefinementSuggestions: RefinementSuggestionsConnector =
  function connectRefinementSuggestions(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      const {
        agentId,
        attributes,
        maxSuggestions = 3,
        debounceMs = 300,
        hitsToSample = 5,
        transformItems = ((items) => items) as NonNullable<
          RefinementSuggestionsConnectorParams['transformItems']
        >,
      } = widgetParams;

      if (!agentId) {
        throw new Error(withUsage('The `agentId` option is required.'));
      }

      let endpoint: string;
      let headers: Record<string, string>;
      let rawSuggestions: Array<Omit<Suggestion, 'isRefined'>> = [];
      let isLoading = false;
      let debounceTimer: ReturnType<typeof setTimeout> | undefined;
      let lastStateSignature: string | null = null; // null means never fetched
      let refine: RefinementSuggestionsRenderState['refine'];
      let searchHelper: InitOptions['helper'] | null = null;
      // Store latest render options to use when debounce fires
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

      // Check if a suggestion is refined, handling hierarchical facets properly
      const checkIsRefined = (attribute: string, value: string): boolean => {
        if (!searchHelper) return false;

        // Check if the attribute belongs to a hierarchical facet
        const hierarchicalFacet = searchHelper.state.hierarchicalFacets.find(
          (facet) => facet.attributes.includes(attribute)
        );

        if (hierarchicalFacet) {
          // For hierarchical facets, check using the facet name
          return searchHelper.state.isHierarchicalFacetRefined(
            hierarchicalFacet.name,
            value
          );
        }

        // For regular facets, use isFacetRefined
        return isFacetRefined(searchHelper, attribute, value);
      };

      const getWidgetRenderState = (
        renderOptions: InitOptions | RenderOptions
      ) => {
        // Compute isRefined on the fly based on current helper state
        const suggestionsWithRefined: Suggestion[] = rawSuggestions.map(
          (suggestion) => ({
            ...suggestion,
            isRefined: checkIsRefined(suggestion.attribute, suggestion.value),
          })
        );

        // Apply transformItems
        const results =
          'results' in renderOptions ? renderOptions.results : undefined;
        const suggestions = transformItems(suggestionsWithRefined, { results });

        return {
          suggestions,
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
          rawSuggestions = [];
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

        const messageText = JSON.stringify({
          query: results.query,
          facets: facetsToSend,
          hitsSample: results.hits.slice(0, hitsToSample),
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
          .then((response) => response.text())
          .then((text) => {
            // Collect all text deltas from the SSE stream
            const fullText = text
              .split('\n')
              .filter(
                (line) => line.startsWith('data: ') && !line.includes('[DONE]')
              )
              .reduce((acc, line) => {
                try {
                  const eventData = JSON.parse(line.slice(6));
                  if (eventData.type === 'text-delta' && eventData.delta) {
                    return acc + eventData.delta;
                  }
                } catch {
                  // Skip non-JSON lines
                }
                return acc;
              }, '');

            // Parse the collected text as JSON array
            const parsed = JSON.parse(fullText);
            rawSuggestions = (Array.isArray(parsed) ? parsed : []).slice(
              0,
              maxSuggestions
            );
          })
          .catch(() => {
            rawSuggestions = [];
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
        $$type: 'ais.refinementSuggestions',

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

          // Production endpoint:
          // endpoint = `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`;
          // Local test endpoint:
          endpoint = `http://127.0.0.1:8000/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`;
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
            refinementSuggestions: this.getWidgetRenderState(renderOptions),
          };
        },

        getWidgetRenderState(renderOptions) {
          return getWidgetRenderState(renderOptions);
        },
      };
    };
  };

export default connectRefinementSuggestions;
