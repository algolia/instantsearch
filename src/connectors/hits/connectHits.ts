import escapeHits, { TAG_PLACEHOLDER } from '../../lib/escape-highlight';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  addAbsolutePosition,
  addQueryID,
  noop,
} from '../../lib/utils';
import {
  RendererOptions,
  WidgetFactory,
  Unmounter,
  Renderer,
} from '../../types';
import { SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'hits',
  connector: true,
});

export type HitsRendererOptions<THitsWidgetParams> = {
  /**
   * The matched hits from Algolia API.
   */
  hits: Array<Record<string, any>>;

  /**
   * The response from Algolia API.
   */
  results?: SearchResults<any>;
} & RendererOptions<THitsWidgetParams & HitsConnectorParams>;

export type HitsConnectorParams = {
  /**
   * Whether to escape HTML tags from `hits[i]._highlightResult`.
   *
   * @default true
   */
  escapeHTML?: boolean;

  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: (
    objects: Array<Record<string, any>>
  ) => Array<Record<string, any>>;
};

export type HitsRenderer<THitsWidgetParams> = Renderer<
  HitsRendererOptions<THitsWidgetParams & HitsConnectorParams>
>;

export type HitsWidgetFactory<THitsWidgetParams> = WidgetFactory<
  THitsWidgetParams & HitsConnectorParams
>;

export default function connectHits<THitsWidgetParams = {}>(
  renderFn: HitsRenderer<HitsConnectorParams & THitsWidgetParams>,
  unmountFn: Unmounter = noop
): HitsWidgetFactory<THitsWidgetParams> {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const { escapeHTML = true, transformItems = items => items } = widgetParams;

    return {
      $$type: 'ais.hits',

      init({ instantSearchInstance }) {
        renderFn(
          {
            hits: [],
            results: undefined,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, instantSearchInstance }) {
        if (escapeHTML && results.hits.length > 0) {
          results.hits = escapeHits(results.hits);
        }

        const initialEscaped = (results.hits as ReturnType<typeof escapeHits>)
          .__escaped;

        results.hits = addAbsolutePosition(
          results.hits,
          results.page,
          results.hitsPerPage
        );

        results.hits = addQueryID(results.hits, results.queryID);

        results.hits = transformItems(results.hits);

        // Make sure the escaped tag stays, even after mapping over the hits.
        // This prevents the hits from being double-escaped if there are multiple
        // hits widgets mounted on the page.
        (results.hits as ReturnType<
          typeof escapeHits
        >).__escaped = initialEscaped;

        renderFn(
          {
            hits: results.hits,
            results,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        if (!escapeHTML) {
          return state;
        }

        return state.setQueryParameters(
          Object.keys(TAG_PLACEHOLDER).reduce(
            (acc, key) => ({
              ...acc,
              [key]: undefined,
            }),
            {}
          )
        );
      },

      getWidgetSearchParameters(state) {
        if (!escapeHTML) {
          return state;
        }

        return state.setQueryParameters(TAG_PLACEHOLDER);
      },
    };
  };
}
