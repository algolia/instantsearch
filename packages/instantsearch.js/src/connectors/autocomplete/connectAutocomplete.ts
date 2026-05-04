import {
  addAbsolutePosition,
  addQueryID,
  escapeHits,
  TAG_PLACEHOLDER,
  checkRendering,
  createDocumentationMessageGenerator,
  createSendEventForHits,
  noop,
  warning,
} from '../../lib/utils';

import type { SendEventForHits } from '../../lib/utils';
import type { Hit, Connector, WidgetRenderState } from '../../types';
import type { SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'autocomplete',
  connector: true,
});

export type AutocompleteSource = {
  /**
   * Whether this source comes from a search index or a Recommend model.
   */
  sourceType: 'index' | 'recommend';

  /**
   * The name of the index (search) or the index used for recommendations.
   */
  indexName: string;

  /**
   * The id of the source (indexId for search, sourceId/model for recommend).
   */
  indexId: string;

  /**
   * The resolved hits from this source.
   */
  hits: Hit[];

  /**
   * The full results object from the Algolia API.
   */
  results: SearchResults | Record<string, never>;

  /**
   * Send event to insights middleware.
   */
  sendEvent: SendEventForHits;
};

/** @deprecated Use `AutocompleteSource` instead. */
export type TransformItemsIndicesConfig = {
  indexName: string;
  indexId: string;
  hits: Hit[];
  results: SearchResults;
};

export type AutocompleteConnectorParams = {
  /**
   * Escapes HTML entities from hits string values.
   *
   * @default `true`
   */
  escapeHTML?: boolean;
  /**
   * Transforms the items of all sources.
   */
  transformItems?: (
    sources: AutocompleteSource[]
  ) => AutocompleteSource[];
  /**
   * Enable usage of future Autocomplete behavior.
   */
  future?: {
    /**
     * When set to true, `currentRefinement` is `undefined` when no query has
     * been set (instead of an empty string). This lets consumers distinguish
     * between "initial/submitted state" and "user explicitly cleared the input".
     *
     * @default `false`
     */
    undefinedEmptyQuery?: boolean;
  };
};

export type AutocompleteRenderState = {
  /**
   * The current value of the query.
   * When `future.undefinedEmptyQuery` is `true`, this is `undefined` when no
   * query has been set yet (e.g. on init or after submit).
   */
  currentRefinement: string | undefined;

  /**
   * The sources this widget has access to — both search indices and
   * Recommend-powered sources. Use `sourceType` to distinguish them.
   */
  sources: AutocompleteSource[];

  /**
   * @deprecated Use `sources` instead.
   */
  indices: Array<{
    indexName: string;
    indexId: string;
    hits: Hit[];
    results: SearchResults;
    sendEvent: SendEventForHits;
  }>;

  /**
   * Searches into the indices with the provided query.
   */
  refine: (query: string) => void;
};

export type AutocompleteWidgetDescription = {
  $$type: 'ais.autocomplete';
  renderState: AutocompleteRenderState;
  indexRenderState: {
    autocomplete: WidgetRenderState<
      AutocompleteRenderState,
      AutocompleteConnectorParams
    >;
  };
  indexUiState: { query: string };
};

export type AutocompleteConnector = Connector<
  AutocompleteWidgetDescription,
  AutocompleteConnectorParams
>;

const connectAutocomplete: AutocompleteConnector = function connectAutocomplete(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    const {
      // @MAJOR: this can default to false
      escapeHTML = true,
      transformItems = ((sources) => sources) as NonNullable<
        AutocompleteConnectorParams['transformItems']
      >,
      future: { undefinedEmptyQuery = false } = {},
    } = widgetParams || {};

    // Private params set by EXPERIMENTAL_autocomplete — not part of the public API.
    const {
      _recommendSources,
      _sourcesOrder,
    } = (widgetParams as any) || {};

    warning(
      !(widgetParams as any).indices,
      `
The option \`indices\` has been removed from the Autocomplete connector.

The indices to target are now inferred from the widgets tree.
${
  Array.isArray((widgetParams as any).indices)
    ? `
An alternative would be:

const autocomplete = connectAutocomplete(renderer);

search.addWidgets([
  ${(widgetParams as any).indices
    .map(({ value }: { value: string }) => `index({ indexName: '${value}' }),`)
    .join('\n  ')}
  autocomplete()
]);
`
    : ''
}
      `
    );

    type ConnectorState = {
      refine?: (query: string) => void;
    };

    const connectorState: ConnectorState = {};

    return {
      $$type: 'ais.autocomplete',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        const { instantSearchInstance } = renderOptions;

        const renderState = this.getWidgetRenderState(renderOptions);

        renderState.sources.forEach(({ sendEvent, hits }) => {
          sendEvent('view:internal', hits);
        });

        renderFn(
          {
            ...renderState,
            instantSearchInstance,
          },
          false
        );
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          autocomplete: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({
        helper,
        state,
        scopedResults,
        instantSearchInstance,
      }) {
        if (!connectorState.refine) {
          connectorState.refine = (query: string) => {
            helper.setQuery(query).search();
          };
        }

        // sendEvent is keyed by indexId/sourceId to survive transformItems reordering.
        const sendEventMap: Record<string, SendEventForHits> = {};

        // Build search sources from scopedResults.
        const searchSourceMap = new Map<string, AutocompleteSource>();
        for (const scopedResult of scopedResults) {
          const results = scopedResult.results as SearchResults | null;
          if (results) {
            results.hits = escapeHTML
              ? escapeHits(results.hits)
              : results.hits;
          }

          sendEventMap[scopedResult.indexId] = createSendEventForHits({
            instantSearchInstance,
            helper: scopedResult.helper,
            widgetType: this.$$type,
          });

          const hits = results
            ? addQueryID(
                addAbsolutePosition(
                  results.hits,
                  results.page,
                  results.hitsPerPage
                ),
                results.queryID
              )
            : [];

          searchSourceMap.set(scopedResult.indexId, {
            sourceType: 'index',
            indexId: scopedResult.indexId,
            indexName: results?.index || '',
            hits,
            results: results || ({} as Record<string, never>),
            sendEvent: sendEventMap[scopedResult.indexId],
          });
        }

        // Build recommend sources from the shared map written by recommend widgets.
        const recommendSourceMap = new Map<string, AutocompleteSource>();
        if (_recommendSources) {
          for (const [sourceId, { hits: rawHits, sendEvent }] of (
            _recommendSources as Map<string, { hits: Hit[]; sendEvent: SendEventForHits }>
          )) {
            // Hits from recommend connectors already have __position and __queryID set.
            const escapedHits = escapeHTML ? escapeHits(rawHits) : rawHits;
            sendEventMap[sourceId] = sendEvent;
            recommendSourceMap.set(sourceId, {
              sourceType: 'recommend',
              indexId: sourceId,
              indexName: '',
              hits: escapedHits,
              results: {},
              sendEvent,
            });
          }
        }

        // Merge sources in the order requested by EXPERIMENTAL_autocomplete.
        // Fall back to search-first if no order is provided (plain connectAutocomplete usage).
        let sources: AutocompleteSource[];
        if (_sourcesOrder) {
          const order = _sourcesOrder as Array<{ sourceId: string; sourceType: 'index' | 'recommend' }>;
          sources = [];
          for (const { sourceId, sourceType } of order) {
            const source =
              sourceType === 'recommend'
                ? recommendSourceMap.get(sourceId)
                : searchSourceMap.get(sourceId);
            if (source) sources.push(source);
          }
          // Safety net: include any search sources not in the order list.
          for (const [indexId, source] of searchSourceMap) {
            if (!order.some((o) => o.sourceId === indexId)) {
              sources.push(source);
            }
          }
        } else {
          sources = [
            ...searchSourceMap.values(),
            ...recommendSourceMap.values(),
          ];
        }

        const transformedSources = transformItems(sources).map(
          (transformedSource) => ({
            ...transformedSource,
            sendEvent: sendEventMap[transformedSource.indexId],
          })
        );

        return {
          currentRefinement: undefinedEmptyQuery
            ? state.query
            : state.query || '',
          sources: transformedSources,
          // @deprecated
          indices: transformedSources
            .filter((s) => s.sourceType === 'index')
            .map((s) => ({
              indexName: s.indexName,
              indexId: s.indexId,
              hits: s.hits,
              results: s.results as SearchResults,
              sendEvent: s.sendEvent,
            })),
          refine: connectorState.refine,
          widgetParams,
        };
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const query = undefinedEmptyQuery
          ? searchParameters.query
          : searchParameters.query || '';

        if (!query || query === '' || (uiState && uiState.query === query)) {
          return uiState;
        }

        return {
          ...uiState,
          query,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const parameters = {
          query: undefinedEmptyQuery ? uiState.query : uiState.query || '',
        };

        if (!escapeHTML) {
          return searchParameters.setQueryParameters(parameters);
        }

        return searchParameters.setQueryParameters({
          ...parameters,
          ...TAG_PLACEHOLDER,
        });
      },

      dispose({ state }) {
        unmountFn();

        const stateWithoutQuery = state.setQueryParameter('query', undefined);

        if (!escapeHTML) {
          return stateWithoutQuery;
        }

        return stateWithoutQuery.setQueryParameters(
          Object.keys(TAG_PLACEHOLDER).reduce(
            (acc, key) => ({
              ...acc,
              [key]: undefined,
            }),
            {}
          )
        );
      },
    };
  };
};

export default connectAutocomplete;
