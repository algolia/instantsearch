import escapeHits, { TAG_PLACEHOLDER } from '../../lib/escape-highlight';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  addAbsolutePosition,
  addQueryID,
  noop,
} from '../../lib/utils';
import { TransformItems, Connector, Hits, Hit, AlgoliaHit } from '../../types';
import { SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'hits',
  connector: true,
});

export type HitsRendererOptions = {
  /**
   * The matched hits from Algolia API.
   */
  hits: Hits;

  /**
   * The response from the Algolia API.
   */
  results?: SearchResults<AlgoliaHit>;
};

export type HitsConnectorParams = {
  /**
   * Whether to escape HTML tags from hits string values.
   *
   * @default true
   */
  escapeHTML?: boolean;

  /**
   * Function to transform the items passed to the templates.
   */
  transformItems?: TransformItems<Hit>;
};

export type HitsConnector = Connector<HitsRendererOptions, HitsConnectorParams>;

const connectHits: HitsConnector = function connectHits(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const { escapeHTML = true, transformItems = items => items } =
      widgetParams || ({} as typeof widgetParams);

    return {
      $$type: 'ais.hits',

      init(initOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          hits: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ results }) {
        if (!results) {
          return {
            hits: [],
            results: undefined,
            widgetParams,
          };
        }

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

        return {
          hits: results.hits,
          results,
          widgetParams,
        };
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
};

export default connectHits;
