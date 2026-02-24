import {
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
   * Transforms the items of all indices.
   */
  transformItems?: (
    indices: TransformItemsIndicesConfig[]
  ) => TransformItemsIndicesConfig[];
};

export type AutocompleteRenderState = {
  /**
   * The current value of the query.
   */
  currentRefinement: string;

  /**
   * The indices this widget has access to.
   */
  indices: Array<{
    /**
     * The name of the index
     */
    indexName: string;

    /**
     * The id of the index
     */
    indexId: string;

    /**
     * The resolved hits from the index matching the query.
     */
    hits: Hit[];

    /**
     * The full results object from the Algolia API.
     */
    results: SearchResults;

    /**
     * Send event to insights middleware
     */
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
      transformItems = ((indices) => indices) as NonNullable<
        AutocompleteConnectorParams['transformItems']
      >,
    } = widgetParams || {};

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

        renderState.indices.forEach(({ sendEvent, hits }) => {
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

        const sendEventMap: Record<string, SendEventForHits> = {};
        const indices = scopedResults.map((scopedResult) => {
          // We need to escape the hits because highlighting
          // exposes HTML tags to the end-user.
          if (scopedResult.results) {
            scopedResult.results.hits = escapeHTML
              ? escapeHits(scopedResult.results.hits)
              : scopedResult.results.hits;
          }

          sendEventMap[scopedResult.indexId] = createSendEventForHits({
            instantSearchInstance,
            helper: scopedResult.helper,
            widgetType: this.$$type,
          });

          return {
            indexId: scopedResult.indexId,
            indexName: scopedResult.results?.index || '',
            hits: scopedResult.results?.hits || [],
            results: scopedResult.results || ({} as unknown as SearchResults),
          };
        });

        return {
          currentRefinement: state.query || '',
          indices: transformItems(indices).map((transformedIndex) => ({
            ...transformedIndex,
            sendEvent: sendEventMap[transformedIndex.indexId],
          })),
          refine: connectorState.refine,
          widgetParams,
        };
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const query = searchParameters.query || '';

        if (query === '' || (uiState && uiState.query === query)) {
          return uiState;
        }

        return {
          ...uiState,
          query,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const parameters = {
          query: uiState.query || '',
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
