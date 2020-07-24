import { SearchResults } from 'algoliasearch-helper';
import escapeHits, { TAG_PLACEHOLDER } from '../../lib/escape-highlight';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
  warning,
} from '../../lib/utils';
import { Hits, Connector } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'autocomplete',
  connector: true,
});

export type AutocompleteConnectorParams = {
  /**
   * Escapes HTML entities from hits string values.
   *
   * @default `true`
   */
  escapeHTML?: boolean;
};

export type AutocompleteRendererOptions = {
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
     * The resolved hits from the index matching the query.
     */
    hits: Hits;

    /**
     * The full results object from the Algolia API.
     */
    results: SearchResults;
  }>;

  /**
   * Searches into the indices with the provided query.
   */
  refine: (query: string) => void;
};

export type AutocompleteConnector = Connector<
  AutocompleteRendererOptions,
  AutocompleteConnectorParams
>;

const connectAutocomplete: AutocompleteConnector = function connectAutocomplete(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const { escapeHTML = true } = widgetParams || ({} as typeof widgetParams);

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

      init({ instantSearchInstance, helper }) {
        connectorState.refine = (query: string) => {
          helper.setQuery(query).search();
        };

        renderFn(
          {
            widgetParams,
            currentRefinement: helper.state.query || '',
            indices: [],
            refine: connectorState.refine,
            instantSearchInstance,
          },
          true
        );
      },

      render({ helper, scopedResults, instantSearchInstance }) {
        const indices = scopedResults.map(scopedResult => {
          // We need to escape the hits because highlighting
          // exposes HTML tags to the end-user.
          scopedResult.results.hits = escapeHTML
            ? escapeHits(scopedResult.results.hits)
            : scopedResult.results.hits;

          return {
            indexId: scopedResult.indexId,
            indexName: scopedResult.results.index,
            hits: scopedResult.results.hits,
            results: scopedResult.results,
          };
        });

        renderFn(
          {
            widgetParams,
            currentRefinement: helper.state.query || '',
            indices,
            refine: connectorState.refine!,
            instantSearchInstance,
          },
          false
        );
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
