import { SearchResults } from 'algoliasearch-helper';
import escapeHits, { TAG_PLACEHOLDER } from '../../lib/escape-highlight';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
  warning,
} from '../../lib/utils';
import {
  RendererOptions,
  Renderer,
  WidgetFactory,
  Hits,
  InstantSearch,
  Unmounter,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'autocomplete',
  connector: true,
});

interface AutocompleteIndex {
  indexName: string;
  hits: Hits;
  results: SearchResults;
}

interface AutocompleteConnectorParams {
  /**
   * Escapes HTML entities from hits string values.
   *
   * @default `true`
   */
  escapeHTML?: boolean;
}

export interface AutocompleteRendererOptions<TAutocompleteWidgetParams>
  extends RendererOptions<TAutocompleteWidgetParams> {
  currentRefinement: string;
  indices: AutocompleteIndex[];
  instantSearchInstance: InstantSearch;
  refine: (query: string) => void;
}

export type AutocompleteRenderer<TAutocompleteWidgetParams> = Renderer<
  AutocompleteRendererOptions<
    AutocompleteConnectorParams & TAutocompleteWidgetParams
  >
>;

export type AutocompleteWidgetFactory<
  TAutocompleteWidgetParams
> = WidgetFactory<AutocompleteConnectorParams & TAutocompleteWidgetParams>;

export type AutocompleteConnector = <TAutocompleteWidgetParams>(
  render: AutocompleteRenderer<TAutocompleteWidgetParams>,
  unmount?: Unmounter
) => AutocompleteWidgetFactory<TAutocompleteWidgetParams>;

const connectAutocomplete: AutocompleteConnector = (
  renderFn,
  unmountFn = noop
) => {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const { escapeHTML = true } = widgetParams || {};

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
    .map(({ value }: { value: string }) => `index({ indexName: '${value}'}),`)
    .join('\n  ')}
  autocomplete()
]);
`
    : ''
}
      `
    );

    type ConnectorState = {
      instantSearchInstance?: InstantSearch;
      refine?: (query: string) => void;
    };

    const connectorState: ConnectorState = {};

    return {
      $$type: 'ais.autocomplete',

      getConfiguration(previousParameters) {
        const parameters = {
          query: previousParameters.query || '',
        };

        if (!escapeHTML) {
          return previousParameters.setQueryParameters(parameters);
        }

        return previousParameters.setQueryParameters({
          ...parameters,
          ...TAG_PLACEHOLDER,
        });
      },

      init({ instantSearchInstance, helper }) {
        connectorState.instantSearchInstance = instantSearchInstance;
        connectorState.refine = (query: string) => {
          helper.setQuery(query).search();
        };

        renderFn(
          {
            widgetParams,
            currentRefinement: helper.state.query || '',
            indices: [],
            refine: connectorState.refine,
            instantSearchInstance: connectorState.instantSearchInstance,
          },
          true
        );
      },

      render({ helper, scopedResults }) {
        const indices = scopedResults.map(scopedResult => {
          scopedResult.results.hits = escapeHTML
            ? escapeHits(scopedResult.results.hits)
            : scopedResult.results.hits;

          return {
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
            instantSearchInstance: connectorState.instantSearchInstance!,
          },
          false
        );
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
